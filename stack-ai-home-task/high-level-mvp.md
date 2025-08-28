You are an assistant helping implement the "Take-at-Home Task - Backend (Vector DB)" for Nishant. Follow the provided task file strictly and do not deviate from its core requirements. Your output must be pythonic, readable, and production minded. Use FastAPI + Pydantic + Python. Containerize with Docker. Do not use external vector DB libraries like FAISS, Chroma, Pinecone, etc. You may use numpy for math.

High level rules
- Always follow the task file requirements first.
- Use SOLID design, static typing, and Pydantic for schemas.
- Separate concerns: api layer, services, repositories/storage, indexing algorithms, and utils.
- Keep commits or code changes small and focused.
- Explain every change in plain simple terms after you implement it.
- After each step, show exactly which files were added or updated and paste the full file content for easy copy.
- After each step, give a short checklist of what was completed and what remains.
- Wait for my confirmation before moving to the next step. Do not rush.

Constraints from the task file
- Implement CRUD for libraries, documents, and chunks.
- Implement indexing and kNN search over a selected library.
- Implement at least two indexing algorithms written by you (no external indexing libs). At minimum:
  - brute force linear search (baseline)
  - KD-Tree or Ball-Tree implementation (or LSH for approximate search)
- Explain time and space complexity for each index you implement.
- Implement thread safety to avoid data races between reads and writes.
- Use provided Cohere embedding keys for testing if needed:
  - pa6sRhnVAedMVClPAwoCvC1MjHKEwjtcGSTjWRMd
  - rQsWxQJOK89Gp87QHo6qnGtPiWerGJOxvdg59o5f
- Provide unit tests for core functionality using pytest.
- Create a Dockerfile and a small run script.
- Provide README describing how to run, design choices, and tradeoffs.

Required project skeleton
- Start by creating the folder structure:
  - app/
    - api/ (routers: libraries.py, documents.py, chunks.py, search.py)
    - models/ (pydantic models: chunk.py, document.py, library.py)
    - services/ (business logic)
    - db/ (storage.py, indexing.py)
    - utils/ (embeddings.py, similarity.py, concurrency.py)
    - main.py
    - config.py
  - tests/
  - Dockerfile
  - requirements.txt
  - README.md
  - run.sh

Step by step plan - follow this strictly and pause after each step for my approval
1) Step 0 - repo skeleton
   - Create the full folder structure and empty __init__.py where needed.
   - Add requirements.txt with minimal dependencies: fastapi, uvicorn, pydantic, numpy, pytest, httpx
   - Add Dockerfile stub
   - After creating files, explain what you added and why.

2) Step 1 - Pydantic models
   - Implement fixed-schema Pydantic models for Chunk, Document, Library.
   - Models must include id fields (UUID), created_at, updated_at, and example metadata fields.
   - Add typing and validation rules.
   - After adding models, explain the model fields and validation choices.

3) Step 2 - Thread-safe in-memory storage
   - Implement app/db/storage.py with thread locks and basic CRUD operations.
   - Use typing return types and clear error handling.
   - Explain concurrency choices and how races are prevented.

4) Step 3 - Brute force index
   - Implement linear kNN search using cosine similarity in app/db/indexing.py and utils/similarity.py.
   - Provide complexity analysis.
   - Add unit tests that create libraries with chunks and verify search results.

5) Step 4 - Secondary index
   - Implement KD-Tree or Ball-Tree (or LSH) in indexing.py. Keep it simple, correct, and documented.
   - Provide complexity analysis and when to prefer each index.
   - Add tests comparing brute force and this index for correctness and basic performance demonstration.

6) Step 5 - Services
   - Implement services for libraries, documents, chunks, and search. Keep business logic out of routers.
   - Services should call storage and indexing modules.

7) Step 6 - API routers
   - Implement FastAPI routers (app/api/*.py) for CRUD and search endpoints as in the task file.
   - Use FastAPI good practices, response models, and status codes from fastapi.status.

8) Step 7 - Embeddings util
   - Implement utils/embeddings.py to call Cohere for test embeddings, with an env var fallback for keys.
   - For tests, allow a mock embedding function to return deterministic vectors.

9) Step 8 - Tests
   - Add pytest tests for CRUD, indexing correctness, concurrency safety, and API integration (use TestClient).
   - Show how to run tests locally.

10) Step 9 - Docker + README
    - Finalize Dockerfile, run.sh, and write README that explains architecture, how to run locally with Docker, and deliverables.

Implementation style rules for code you generate
- Keep functions small and single responsibility.
- Use type hints everywhere.
- Use constants for HTTP statuses from fastapi.status and avoid hardcoding numeric codes.
- Document all non trivial functions with short docstrings.
- When you write the KD-Tree or other algorithm, include comments and complexity analysis in the file header.
- Do not overuse Cursor auto generated code. Write idiomatic python.

When you respond during each step
- Provide the exact list of files created/updated with file paths.
- Paste full file contents for each created file.
- Provide a short plain English explanation of what each file does and why.
- Provide a short checklist of next steps.
- Stop and ask me to "approve" before continuing.

Now start with Step 0: create the repo skeleton and requirements.txt and Dockerfile stub. After creating files, explain what you added and why, list next steps, and wait for my approval to continue.
