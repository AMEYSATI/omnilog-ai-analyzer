1- OmniLog AI
Real-Time Microservices Error Analysis Engine
OmniLog AI is a distributed system designed to solve the "MTTR" (Mean Time To Resolution) gap. It ingests raw backend logs, processes them through an asynchronous pipeline, and leverages Gemini 2.5 Flash Lite to provide instant, actionable code fixes.


2- System Architecture
This project is built as a Microservices Monorepo, demonstrating proficiency in distributed systems and service orchestration.

Ingestion Service: A high-speed entry point that validates incoming logs and offloads them to the queue.

Redis Queue (BullMQ): Acts as the system’s "waiting room," ensuring reliability and handling traffic spikes without losing data.

Analysis Worker: A specialized service that fetches jobs from Redis, interacts with the Gemini AI API, and pushes solutions to the database.

Dashboard & Frontend: A React-based interface with a dedicated backend for managing user projects and live log updates.

![alt text](Gemini_Generated_Image_cmn4z4cmn4z4cmn4.png)