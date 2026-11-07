import os
import time
import socket
from pathlib import Path
from dotenv import load_dotenv

# Load env variables from .env file
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

from .adapters.cf_ai import CloudflareAIAdapter
from .adapters.tavily import TavilyAdapter
from .db import DatabaseClient
from .job_runner import run_job

def main():
    worker_id = os.getenv("WORKER_ID", f"worker-{socket.gethostname()}-{os.getpid()}")
    poll_interval = int(os.getenv("POLL_INTERVAL_SECONDS", "5"))
    lease_seconds = int(os.getenv("LEASE_SECONDS", "120"))

    print("=" * 60)
    print("OAuth Setup Intelligence — Research Worker")
    print(f"Worker ID    : {worker_id}")
    print(f"Poll Interval: {poll_interval}s")
    print("=" * 60)

    db = DatabaseClient()
    cf_ai = CloudflareAIAdapter()
    tavily = TavilyAdapter()

    print("[Ready] Listening for generation jobs from Supabase...")
    while True:
        try:
            job = db.claim_next_job(worker_id=worker_id, lease_secs=lease_seconds)
            if job:
                print(f"[Claimed] Job {job['id']} for query: '{job.get('input', {}).get('query')}'")
                run_job(job, worker_id, db, cf_ai, tavily)
            else:
                time.sleep(poll_interval)
        except KeyboardInterrupt:
            print("\nWorker stopped by user.")
            break
        except Exception as e:
            print(f"[Worker Error] {e}")
            time.sleep(poll_interval)

if __name__ == "__main__":
    main()
