import os
import shutil

def clean_pycache(start_path):
    for root, dirs, files in os.walk(start_path):
        if '__pycache__' in dirs:
            pycache_path = os.path.join(root, '__pycache__')
            print(f"Removing: {pycache_path}")
            shutil.rmtree(pycache_path)
        for file in files:
            if file.endswith('.pyc'):
                pyc_path = os.path.join(root, file)
                print(f"Removing: {pyc_path}")
                os.remove(pyc_path)

if __name__ == "__main__":
    project_root = os.path.dirname(os.path.abspath(__file__))
    print(f"Cleaning Python caches in: {project_root}")
    clean_pycache(project_root)
    print("Cleanup complete.")