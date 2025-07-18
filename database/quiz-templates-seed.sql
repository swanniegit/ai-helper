-- Additional Quiz Templates for Common Development Skills
-- This adds templates for popular development categories that users might select

INSERT INTO public.quiz_templates (name, description, quiz_type, skill_category, difficulty_level, question_count, time_limit_minutes, passing_score) VALUES
-- API Development
('API Development Basics', 'Fundamentals of API design and implementation', 'practice', 'API Development', 'beginner', 10, 15, 70),
('API Development Intermediate', 'RESTful APIs, authentication, and best practices', 'practice', 'API Development', 'intermediate', 10, 20, 75),
('API Development Advanced', 'Advanced API patterns, GraphQL, and microservices', 'practice', 'API Development', 'advanced', 10, 25, 80),

-- JavaScript
('JavaScript Fundamentals', 'Basic JavaScript concepts and syntax', 'practice', 'JavaScript', 'beginner', 10, 15, 70),
('JavaScript Intermediate', 'ES6+, async/await, and modern JavaScript', 'practice', 'JavaScript', 'intermediate', 10, 20, 75),
('JavaScript Advanced', 'Advanced patterns, closures, and performance', 'practice', 'JavaScript', 'advanced', 10, 25, 80),

-- TypeScript
('TypeScript Basics', 'Introduction to TypeScript and type annotations', 'practice', 'TypeScript', 'beginner', 10, 15, 70),
('TypeScript Intermediate', 'Advanced types, generics, and interfaces', 'practice', 'TypeScript', 'intermediate', 10, 20, 75),
('TypeScript Advanced', 'Advanced TypeScript patterns and utility types', 'practice', 'TypeScript', 'advanced', 10, 25, 80),

-- React
('React Fundamentals', 'Components, props, and state management', 'practice', 'React', 'beginner', 10, 15, 70),
('React Intermediate', 'Hooks, context, and performance optimization', 'practice', 'React', 'intermediate', 10, 20, 75),
('React Advanced', 'Advanced patterns and custom hooks', 'practice', 'React', 'advanced', 10, 25, 80),

-- Node.js
('Node.js Basics', 'Server-side JavaScript with Node.js', 'practice', 'Node.js', 'beginner', 10, 15, 70),
('Node.js Intermediate', 'Express.js, middleware, and databases', 'practice', 'Node.js', 'intermediate', 10, 20, 75),
('Node.js Advanced', 'Performance, scaling, and advanced patterns', 'practice', 'Node.js', 'advanced', 10, 25, 80),

-- Python
('Python Fundamentals', 'Basic Python syntax and data structures', 'practice', 'Python', 'beginner', 10, 15, 70),
('Python Intermediate', 'OOP, decorators, and file handling', 'practice', 'Python', 'intermediate', 10, 20, 75),
('Python Advanced', 'Advanced concepts and design patterns', 'practice', 'Python', 'advanced', 10, 25, 80),

-- SQL
('SQL Fundamentals', 'Basic SQL queries and database operations', 'practice', 'SQL', 'beginner', 10, 15, 70),
('SQL Intermediate', 'Joins, subqueries, and aggregate functions', 'practice', 'SQL', 'intermediate', 10, 20, 75),
('SQL Advanced', 'Advanced queries, optimization, and performance', 'practice', 'SQL', 'advanced', 10, 25, 80),

-- DevOps
('DevOps Basics', 'Introduction to DevOps practices and tools', 'practice', 'DevOps', 'beginner', 10, 15, 70),
('DevOps Intermediate', 'CI/CD, containerization, and automation', 'practice', 'DevOps', 'intermediate', 10, 20, 75),
('DevOps Advanced', 'Advanced DevOps practices and orchestration', 'practice', 'DevOps', 'advanced', 10, 25, 80),

-- Docker
('Docker Fundamentals', 'Containerization basics with Docker', 'practice', 'Docker', 'beginner', 10, 15, 70),
('Docker Intermediate', 'Docker Compose and multi-container apps', 'practice', 'Docker', 'intermediate', 10, 20, 75),
('Docker Advanced', 'Advanced Docker features and optimization', 'practice', 'Docker', 'advanced', 10, 25, 80),

-- AWS
('AWS Fundamentals', 'Introduction to AWS cloud services', 'practice', 'AWS', 'beginner', 10, 15, 70),
('AWS Intermediate', 'EC2, S3, and core AWS services', 'practice', 'AWS', 'intermediate', 10, 20, 75),
('AWS Advanced', 'Advanced AWS architecture and best practices', 'practice', 'AWS', 'advanced', 10, 25, 80),

-- Git
('Git Fundamentals', 'Version control basics with Git', 'practice', 'Git', 'beginner', 10, 15, 70),
('Git Intermediate', 'Branching, merging, and collaboration', 'practice', 'Git', 'intermediate', 10, 20, 75),
('Git Advanced', 'Advanced Git workflows and strategies', 'practice', 'Git', 'advanced', 10, 25, 80),

-- Testing
('Testing Fundamentals', 'Introduction to software testing concepts', 'practice', 'Testing', 'beginner', 10, 15, 70),
('Testing Intermediate', 'Unit testing, integration testing, and TDD', 'practice', 'Testing', 'intermediate', 10, 20, 75),
('Testing Advanced', 'Advanced testing strategies and automation', 'practice', 'Testing', 'advanced', 10, 25, 80),

-- Mobile Development
('Mobile Development Basics', 'Introduction to mobile app development', 'practice', 'Mobile Development', 'beginner', 10, 15, 70),
('Mobile Development Intermediate', 'Cross-platform development and UI/UX', 'practice', 'Mobile Development', 'intermediate', 10, 20, 75),
('Mobile Development Advanced', 'Advanced mobile patterns and performance', 'practice', 'Mobile Development', 'advanced', 10, 25, 80);

-- Sample questions for API Development (to prevent errors)
INSERT INTO public.quiz_questions (template_id, question_text, question_type, options, correct_answer, explanation, difficulty_level, skill_tags) VALUES
((SELECT id FROM public.quiz_templates WHERE name = 'API Development Intermediate' LIMIT 1), 
 'What does REST stand for?', 
 'multiple_choice', 
 '["Representational State Transfer", "Remote State Transfer", "Relational State Transfer", "Reactive State Transfer"]', 
 'Representational State Transfer', 
 'REST stands for Representational State Transfer, an architectural style for distributed systems.', 
 'intermediate', 
 ARRAY['API Development', 'REST']),

((SELECT id FROM public.quiz_templates WHERE name = 'API Development Intermediate' LIMIT 1), 
 'Which HTTP method is typically used to create a new resource?', 
 'multiple_choice', 
 '["GET", "POST", "PUT", "DELETE"]', 
 'POST', 
 'POST is typically used to create new resources in RESTful APIs.', 
 'intermediate', 
 ARRAY['API Development', 'HTTP methods']),

((SELECT id FROM public.quiz_templates WHERE name = 'API Development Intermediate' LIMIT 1), 
 'What is the purpose of HTTP status codes?', 
 'multiple_choice', 
 '["To identify the client", "To indicate the result of an HTTP request", "To encrypt data", "To route requests"]', 
 'To indicate the result of an HTTP request', 
 'HTTP status codes provide information about the outcome of an HTTP request.', 
 'intermediate', 
 ARRAY['API Development', 'HTTP status codes']),

((SELECT id FROM public.quiz_templates WHERE name = 'API Development Intermediate' LIMIT 1), 
 'Which status code indicates a successful GET request?', 
 'multiple_choice', 
 '["200", "201", "404", "500"]', 
 '200', 
 'Status code 200 indicates a successful HTTP request.', 
 'intermediate', 
 ARRAY['API Development', 'HTTP status codes']),

((SELECT id FROM public.quiz_templates WHERE name = 'API Development Intermediate' LIMIT 1), 
 'What is JSON commonly used for in APIs?', 
 'multiple_choice', 
 '["Styling web pages", "Data serialization and exchange", "Database storage", "User authentication"]', 
 'Data serialization and exchange', 
 'JSON is commonly used for data serialization and exchange in APIs.', 
 'intermediate', 
 ARRAY['API Development', 'JSON']),

((SELECT id FROM public.quiz_templates WHERE name = 'API Development Intermediate' LIMIT 1), 
 'Which authentication method uses tokens?', 
 'multiple_choice', 
 '["Basic Auth", "API Key", "JWT", "OAuth"]', 
 'JWT', 
 'JWT (JSON Web Tokens) is a popular token-based authentication method.', 
 'intermediate', 
 ARRAY['API Development', 'authentication']),

((SELECT id FROM public.quiz_templates WHERE name = 'API Development Intermediate' LIMIT 1), 
 'What does CORS stand for?', 
 'multiple_choice', 
 '["Cross-Origin Resource Sharing", "Cross-Origin Request Security", "Cross-Origin Resource Security", "Cross-Origin Request Sharing"]', 
 'Cross-Origin Resource Sharing', 
 'CORS stands for Cross-Origin Resource Sharing, a security feature implemented by web browsers.', 
 'intermediate', 
 ARRAY['API Development', 'CORS']),

((SELECT id FROM public.quiz_templates WHERE name = 'API Development Intermediate' LIMIT 1), 
 'Which HTTP method is idempotent?', 
 'multiple_choice', 
 '["POST", "GET", "PATCH", "All of the above"]', 
 'GET', 
 'GET is idempotent, meaning multiple identical requests should have the same effect as a single request.', 
 'intermediate', 
 ARRAY['API Development', 'HTTP methods']),

((SELECT id FROM public.quiz_templates WHERE name = 'API Development Intermediate' LIMIT 1), 
 'What is the purpose of API versioning?', 
 'multiple_choice', 
 '["To track changes", "To maintain backward compatibility", "To improve performance", "To reduce costs"]', 
 'To maintain backward compatibility', 
 'API versioning allows maintaining backward compatibility while introducing new features.', 
 'intermediate', 
 ARRAY['API Development', 'versioning']),

((SELECT id FROM public.quiz_templates WHERE name = 'API Development Intermediate' LIMIT 1), 
 'Which content type is commonly used for API responses?', 
 'multiple_choice', 
 '["text/html", "application/json", "image/png", "video/mp4"]', 
 'application/json', 
 'application/json is the most common content type for API responses.', 
 'intermediate', 
 ARRAY['API Development', 'content types']);