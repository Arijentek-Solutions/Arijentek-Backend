Tech Stack

We are building a Careers Backend API using:

Node.js

Express.js

TypeScript

Prisma ORM

PostgreSQL

Docker (for local database)

AWS S3 (for storing resumes later)

AWS (for hosting)

What the System Will Do

This backend will support a company careers page.

Two types of users interact with it:

1. Admin

Admin can:

Login to the admin panel

Create job postings

Update job postings

Delete job postings

View job applications

Change application status

2. Public Users

Users visiting the careers page can:

View available jobs

View job details

Apply for a job

Upload resume (later using S3)

Main Backend Modules

The backend will contain these modules:

Admin Module

Handles admin authentication.

APIs:

POST /api/admin/register (temporary for development)

POST /api/admin/login

Job Module

Handles job listings.

APIs:

GET /api/jobs

GET /api/jobs/:slug

POST /api/admin/jobs

PUT /api/admin/jobs/:id

DELETE /api/admin/jobs/:id

Application Module

Handles job applications.

APIs:

POST /api/applications

GET /api/admin/applications

PATCH /api/admin/applications/:id

Database Models

We will have three main tables.

Admin

Fields:

id

email

password

createdAt

Purpose:
Stores admin login credentials.

Job

Fields:

id

title

slug

department

location

jobType

experience

description

status

createdAt

Purpose:
Stores job postings created by admin.

Application

Fields:

id

name

email

phone

portfolio

resumeUrl

coverLetter

status

createdAt

jobId

Purpose:
Stores job applications submitted by candidates.

Development Setup

During development:

Backend runs locally

PostgreSQL runs in Docker

Prisma connects to PostgreSQL

Later in production:

Backend hosted on AWS

PostgreSQL hosted on AWS RDS

Resumes stored in AWS S3

Development Phases
Phase 1

Setup project:

Node.js

TypeScript

Express

Prisma

Docker PostgreSQL

Phase 2

Create database models:

Admin

Job

Application

Run Prisma migrations.

Phase 3

Build authentication:

Admin register (temporary)

Admin login

JWT authentication

Phase 4

Build job APIs:

Create job

Get jobs

Update job

Delete job

Phase 5

Build application APIs:

Submit application

View applications

Update application status

Phase 6

Add resume upload:

Upload to AWS S3

Save resume URL in database

Phase 7

Deploy backend to AWS.