#!/usr/bin/env python3
"""
Performance Change Detector and Email Notifier

This script compares the latest performance results with the previous results
and sends an email notification if any operation's performance change exceeds 20%.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import requests


class PerformanceChangeDetector:
    def __init__(self, threshold_percent=20.0):
        self.threshold_percent = threshold_percent
        self.data_dir = Path("data")
        self.index_file = self.data_dir / "index.json"
        
    def load_index(self) -> Dict:
        """Load the index.json file."""
        try:
            with open(self.index_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading index.json: {e}")
            return {}
    
    def get_latest_two_results(self) -> Tuple[Optional[Dict], Optional[Dict]]:
        """Get the two most recent performance measurement files."""
        index_data = self.load_index()
        files = index_data.get('files', [])
        
        if len(files) < 2:
            print(f"⚠️ Not enough data to compare. Found {len(files)} measurement(s).")
            return None, None
        
        # Files are already sorted by measurement_date (newest first)
        latest_path = self.data_dir / files[0]['path'].replace('data/', '')
        previous_path = self.data_dir / files[1]['path'].replace('data/', '')
        
        try:
            with open(latest_path, 'r') as f:
                latest_data = json.load(f)
            print(f"📄 Latest results: {files[0]['filename']}")
            print(f"   Date: {files[0]['measurement_date']}")
        except Exception as e:
            print(f"❌ Error loading latest results: {e}")
            return None, None
        
        try:
            with open(previous_path, 'r') as f:
                previous_data = json.load(f)
            print(f"📄 Previous results: {files[1]['filename']}")
            print(f"   Date: {files[1]['measurement_date']}")
        except Exception as e:
            print(f"❌ Error loading previous results: {e}")
            return None, None
        
        return latest_data, previous_data
    
    def compare_results(self, latest: Dict, previous: Dict) -> List[Dict]:
        """
        Compare two performance results and find operations with >threshold% change.
        
        Returns a list of operations with significant changes.
        """
        significant_changes = []
        
        # Create lookup dictionaries for quick access
        latest_ops = {result['operation_name']: result for result in latest.get('results', [])}
        previous_ops = {result['operation_name']: result for result in previous.get('results', [])}
        
        # Compare each operation
        for op_name, latest_result in latest_ops.items():
            if op_name not in previous_ops:
                continue
            
            previous_result = previous_ops[op_name]
            
            latest_avg = latest_result.get('average_duration_ns', 0)
            previous_avg = previous_result.get('average_duration_ns', 0)
            
            if previous_avg == 0:
                continue
            
            # Calculate percentage change
            change_percent = ((latest_avg - previous_avg) / previous_avg) * 100
            
            # Check if change exceeds threshold
            if abs(change_percent) >= self.threshold_percent:
                change_info = {
                    'operation_name': op_name,
                    'test_name': latest_result.get('test_name', op_name),
                    'previous_avg_ns': previous_avg,
                    'latest_avg_ns': latest_avg,
                    'change_percent': change_percent,
                    'change_type': 'improvement' if change_percent < 0 else 'regression',
                    'previous_timestamp': previous_result.get('timestamp', 'unknown'),
                    'latest_timestamp': latest_result.get('timestamp', 'unknown')
                }
                significant_changes.append(change_info)
        
        return significant_changes
    
    def format_email_body(self, changes: List[Dict], latest_metadata: Dict, previous_metadata: Dict) -> str:
        """Format the email body with performance change details."""
        if not changes:
            return "No significant performance changes detected."
        
        # Sort by absolute change percentage (highest first)
        changes.sort(key=lambda x: abs(x['change_percent']), reverse=True)
        
        # Count regressions and improvements
        regressions = [c for c in changes if c['change_type'] == 'regression']
        improvements = [c for c in changes if c['change_type'] == 'improvement']
        
        html_body = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .header {{ background-color: #f8d7da; padding: 20px; border-radius: 5px; margin-bottom: 20px; }}
                .header.warning {{ background-color: #fff3cd; }}
                .summary {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }}
                .operation {{ border-left: 4px solid #dc3545; padding: 10px; margin: 10px 0; background-color: #fff; }}
                .operation.improvement {{ border-left-color: #28a745; }}
                .regression {{ color: #dc3545; font-weight: bold; }}
                .improvement {{ color: #28a745; font-weight: bold; }}
                .metric {{ font-family: monospace; background-color: #f8f9fa; padding: 2px 6px; border-radius: 3px; }}
                table {{ border-collapse: collapse; width: 100%; margin: 10px 0; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f8f9fa; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h2>⚠️ TTNN Performance Alert</h2>
                <p>Significant performance changes detected (threshold: {self.threshold_percent}%)</p>
            </div>
            
            <div class="summary">
                <h3>Summary</h3>
                <table>
                    <tr>
                        <th>Metric</th>
                        <th>Count</th>
                    </tr>
                    <tr>
                        <td>Total Operations with Changes &gt; {self.threshold_percent}%</td>
                        <td><strong>{len(changes)}</strong></td>
                    </tr>
                    <tr style="background-color: #f8d7da;">
                        <td>Performance Regressions</td>
                        <td><strong>{len(regressions)}</strong></td>
                    </tr>
                    <tr style="background-color: #d4edda;">
                        <td>Performance Improvements</td>
                        <td><strong>{len(improvements)}</strong></td>
                    </tr>
                </table>
                
                <p>
                    <strong>Latest Measurement:</strong> {latest_metadata.get('measurement_date', 'unknown')}<br>
                    <strong>Previous Measurement:</strong> {previous_metadata.get('measurement_date', 'unknown')}<br>
                    <strong>Git Commit:</strong> <code>{latest_metadata.get('git_commit_id', 'unknown')[:8]}</code>
                </p>
            </div>
            
            <h3>Detailed Changes</h3>
        """
        
        # Add regressions first
        if regressions:
            html_body += "<h4 style='color: #dc3545;'>⬇️ Performance Regressions (Slower)</h4>"
            for change in regressions:
                change_sign = "+" if change['change_percent'] > 0 else ""
                html_body += f"""
                <div class="operation">
                    <h4>{change['operation_name']}</h4>
                    <p class="regression">Change: {change_sign}{change['change_percent']:.2f}%</p>
                    <table>
                        <tr>
                            <th>Metric</th>
                            <th>Previous</th>
                            <th>Latest</th>
                            <th>Difference</th>
                        </tr>
                        <tr>
                            <td>Average Duration (ns)</td>
                            <td class="metric">{change['previous_avg_ns']:.2f}</td>
                            <td class="metric">{change['latest_avg_ns']:.2f}</td>
                            <td class="metric">{change['latest_avg_ns'] - change['previous_avg_ns']:.2f}</td>
                        </tr>
                        <tr>
                            <td>Average Duration (μs)</td>
                            <td class="metric">{change['previous_avg_ns']/1000:.2f}</td>
                            <td class="metric">{change['latest_avg_ns']/1000:.2f}</td>
                            <td class="metric">{(change['latest_avg_ns'] - change['previous_avg_ns'])/1000:.2f}</td>
                        </tr>
                    </table>
                </div>
                """
        
        # Add improvements
        if improvements:
            html_body += "<h4 style='color: #28a745;'>⬆️ Performance Improvements (Faster)</h4>"
            for change in improvements:
                change_sign = "+" if change['change_percent'] > 0 else ""
                html_body += f"""
                <div class="operation improvement">
                    <h4>{change['operation_name']}</h4>
                    <p class="improvement">Change: {change_sign}{change['change_percent']:.2f}%</p>
                    <table>
                        <tr>
                            <th>Metric</th>
                            <th>Previous</th>
                            <th>Latest</th>
                            <th>Difference</th>
                        </tr>
                        <tr>
                            <td>Average Duration (ns)</td>
                            <td class="metric">{change['previous_avg_ns']:.2f}</td>
                            <td class="metric">{change['latest_avg_ns']:.2f}</td>
                            <td class="metric">{change['latest_avg_ns'] - change['previous_avg_ns']:.2f}</td>
                        </tr>
                        <tr>
                            <td>Average Duration (μs)</td>
                            <td class="metric">{change['previous_avg_ns']/1000:.2f}</td>
                            <td class="metric">{change['latest_avg_ns']/1000:.2f}</td>
                            <td class="metric">{(change['latest_avg_ns'] - change['previous_avg_ns'])/1000:.2f}</td>
                        </tr>
                    </table>
                </div>
                """
        
        html_body += """
            <hr>
            <p style="color: #6c757d; font-size: 12px;">
                This is an automated email from the TTNN Performance Dashboard.<br>
                Repository: <a href="https://github.com/Aswintechie/ttnn-performance-dashboard">Aswintechie/ttnn-performance-dashboard</a>
            </p>
        </body>
        </html>
        """
        
        return html_body
    
    def send_email_resend(self, subject: str, html_body: str, to_email: str, api_key: str) -> bool:
        """
        Send email using Resend API.
        
        Args:
            subject: Email subject
            html_body: HTML email body
            to_email: Recipient email address
            api_key: Resend API key
            
        Returns:
            True if email sent successfully, False otherwise
        """
        url = "https://api.resend.com/emails"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": "TTNN Performance Dashboard <onboarding@resend.dev>",
            "to": [to_email],
            "subject": subject,
            "html": html_body
        }
        
        try:
            print(f"📧 Sending email to {to_email}...")
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                print(f"✅ Email sent successfully!")
                print(f"   Response: {response.json()}")
                return True
            else:
                print(f"❌ Failed to send email. Status code: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error sending email: {e}")
            return False
    
    def run(self, api_key: str, to_email: str) -> int:
        """
        Main execution method.
        
        Returns:
            0 if successful (changes detected and email sent or no changes found)
            1 if error occurred
        """
        print("🔍 TTNN Performance Change Detector")
        print(f"   Threshold: {self.threshold_percent}%")
        print(f"   Data directory: {self.data_dir.absolute()}")
        print()
        
        # Get latest two results
        latest, previous = self.get_latest_two_results()
        
        if latest is None or previous is None:
            print("❌ Cannot proceed without both latest and previous results.")
            return 1
        
        print()
        print("🔬 Comparing performance results...")
        
        # Compare results
        changes = self.compare_results(latest, previous)
        
        print(f"\n📊 Found {len(changes)} operation(s) with >{self.threshold_percent}% change")
        
        if not changes:
            print("✅ No significant performance changes detected.")
            return 0
        
        # Print summary to console
        regressions = [c for c in changes if c['change_type'] == 'regression']
        improvements = [c for c in changes if c['change_type'] == 'improvement']
        
        print(f"   ⬇️ Regressions: {len(regressions)}")
        print(f"   ⬆️ Improvements: {len(improvements)}")
        print()
        
        # Print details
        for change in sorted(changes, key=lambda x: abs(x['change_percent']), reverse=True):
            symbol = "📉" if change['change_type'] == 'regression' else "📈"
            sign = "+" if change['change_percent'] > 0 else ""
            print(f"{symbol} {change['operation_name']}: {sign}{change['change_percent']:.2f}% "
                  f"({change['previous_avg_ns']:.2f}ns → {change['latest_avg_ns']:.2f}ns)")
        
        print()
        
        # Format and send email
        latest_metadata = latest.get('metadata', {})
        previous_metadata = previous.get('metadata', {})
        
        subject = f"⚠️ TTNN Performance Alert: {len(changes)} operation(s) changed >{self.threshold_percent}%"
        html_body = self.format_email_body(changes, latest_metadata, previous_metadata)
        
        # Send email
        success = self.send_email_resend(subject, html_body, to_email, api_key)
        
        if success:
            print("✅ Performance change detection and notification completed successfully!")
            return 0
        else:
            print("⚠️ Performance changes detected but email notification failed.")
            return 1


def main():
    """Main function for command line usage."""
    # Get Resend API key from environment variable
    api_key = os.environ.get('RESEND_API_KEY')
    if not api_key:
        print("❌ Error: RESEND_API_KEY environment variable not set")
        print("   Please set it with: export RESEND_API_KEY='your-api-key'")
        sys.exit(1)
    
    # Get recipient email (default to aswin@aswincloud.com)
    to_email = os.environ.get('ALERT_EMAIL', 'aswin@aswincloud.com')
    
    # Get threshold from environment or use default
    threshold = float(os.environ.get('PERF_CHANGE_THRESHOLD', '20.0'))
    
    # Create detector and run
    detector = PerformanceChangeDetector(threshold_percent=threshold)
    exit_code = detector.run(api_key, to_email)
    
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
