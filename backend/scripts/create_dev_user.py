"""
Create development user in Supabase profiles table
Run this script once to set up the dev user
"""

import sys
import os
from datetime import datetime

# Add parent directory to path to import services
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.supabase_client import get_supabase

def create_dev_users():
    """Create development and placeholder users"""
    try:
        supabase = get_supabase()
        
        users = [
            {
                'id': '00000000-0000-0000-0000-000000000001',
                'email': 'dev@mindmate.local',
                'name': 'Development User',
                'user_type': 'individual',
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            },
            {
                'id': '00000000-0000-0000-0000-000000000000',
                'email': 'placeholder@mindmate.local',
                'name': 'Placeholder User',
                'user_type': 'individual',
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
        ]
        
        for user in users:
            try:
                # Try to insert the user
                result = supabase.table('profiles').insert(user).execute()
                print(f"✅ Created user: {user['email']} (ID: {user['id']})")
            except Exception as e:
                if '23505' in str(e):  # Unique violation - user already exists
                    print(f"ℹ️  User already exists: {user['email']} (ID: {user['id']})")
                else:
                    print(f"❌ Error creating user {user['email']}: {str(e)}")
        
        # Verify users exist
        print("\n📋 Verifying users...")
        result = supabase.table('profiles').select('id, email, name').in_(
            'id', 
            ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000']
        ).execute()
        
        if result.data:
            print(f"\n✅ Found {len(result.data)} dev users:")
            for user in result.data:
                print(f"   - {user['name']} ({user['email']})")
        else:
            print("\n❌ No dev users found!")
        
        print("\n🎉 Setup complete! You can now use the therapy chat.")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    print("🚀 Creating development users...\n")
    create_dev_users()
