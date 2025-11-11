# Medley Master 

## Overview

As a competitive swimmer of 12+ years I have been a part of and watched many relays, from local Arena League competitions to Olympic finals. I always wondered whether each team really was the fastest possible, especially in mixed medley relays, or in those situations where one swimmer is the fastest over all 4 srokes, and is inevitably made to swim their worst stroke! I finally decided that this was something that could be calculated and set about creating the code to do so. This tool can take any number of swimmers, directly imported from Aquatics GB rankings, and calculate not just the fastest team, but also alternative options, allowing some discretion from coaches. 

I coded the initial logic in python before deciding this was an exciting applicaiton that would benefit from a full frontend website. Since I had no prior experience in frontend development, this project also served as a tool to learn HTML, CSS and JavaScript.

## Key learnings
### Algorithm
    One of the most rewarding aspects of this project was implementing Murty’s algorithm to generate the top-k optimal swimmer-to-stroke assignments. I learned how to adapt the Hungarian (Munkres) algorithm to solve individual assignment problems and extend it to explore multiple near-optimal solutions by systematically fixing and forbidding assignment pairs. This required careful matrix manipulation, padding with dummy jobs to maintain square dimensions, and managing a priority queue to expand subproblems efficiently. I also gained insight into handling constraints like gender-balanced teams and filtering duplicate solutions. Overall, this deepened my understanding of combinatorial optimization, algorithmic design, and the importance of clean data structures in scalable problem-solving.
### Python
   A major part of my Python learning during this project came from building a data pipeline that connected web scraping, SQL integration, and asynchronous processing. I used Python to extract swimmer data from online sources, clean and structure it, and store it in a PostgreSQL database via a custom script. To streamline this workflow within the website, I implemented FastAPI to run asynchronous functions in the background, allowing data updates and processing to happen without blocking the user experience. This taught me how to manage database connections efficiently, handle concurrency with async tasks, and design scalable backend logic that complements a responsive frontend.
### HTML/CSS/JS
    When I started this project, I had no experience with HTML, CSS, or JavaScript. Learning how to structure a page with HTML was my first step, and it gave me a foundation for understanding how content is organized on the web. CSS introduced me to layout, spacing, and responsive design, and I gradually learned how to use flexbox, media queries, and transitions to create a visually consistent experience across devices. JavaScript was the most challenging at first, but it quickly became one of the most rewarding parts of the project. I learned how to manipulate the DOM, respond to user interactions, and build features like animated dropdown menus and dynamic content updates.

    As the project grew, I began connecting the frontend to my Python backend, creating a full-stack experience. I used JavaScript to send and receive data from the server, allowing the site to trigger background processes and update content without refreshing the page. This helped me understand how different layers of a web application communicate and how to design interfaces that feel smooth and responsive. Building this connection between frontend and backend gave me a much clearer picture of how modern web applications work and how to structure code that is both modular and maintainable.

### SQL 
    This project gave me hands-on experience with SQL, particularly in designing and interacting with a PostgreSQL database. I learned how to structure tables to store swimmer data efficiently, and how to populate the database using Python scripts that automated the insertion of scraped and cleaned data. Writing SQL queries helped me understand how to filter, join, and aggregate data to support different parts of the application. I also connected the database to my backend logic, allowing the website to retrieve and update information dynamically. This process taught me how to manage connections securely, handle query errors gracefully, and think critically about data flow between the frontend, backend, and database.

### Deploying/Hosting
    One of the final and most empowering steps in this project was deploying the website and backend to live platforms. I used Render to host the frontend and serve my Python backend, and Neon to manage the PostgreSQL database in the cloud. This taught me how to configure environment variables, handle deployment pipelines, and troubleshoot issues that only appear in production. I learned the importance of separating static assets from dynamic endpoints, and how to structure my project for scalability and maintainability. Seeing the site live and accessible to others was a rewarding moment as it turned a local experiment into a tangible, shareable product.

## Reflections
With this project involving a lot of new concepts, techniques and languages there are inevitabally a lot of things I would do differently. Firstly, I would definitely consider mobile usability earlier. Throughout the whole process I was editing the layout based on how it looked on my computer, without thinking much about how the majority of users would access it, on mobile. This resulted in a lot of editing after the project was finished in order to change the html/css to be more mobile-user friendly.

Whilst I used Git throughout, in future projects I would be more deliberate with branching strategies and commit messages. Whilst missing this was ok for this solo project, implementing best practices in future projects will enforce good habits and prepare me for future work in teams, either in University projects or when starting my career next year.

Another accessibility issue I encountered was not modularising code. For a long time I simply had main.py, style.css etc. which lead to messy, long files and not being able to find anything. I would definitely split up my files earlier to improve readability and save myself time when looking for particular sections of code.

## What's next

Whilst for now this project is finished, I may resume in the future to implement some new ideas. I would love to dive into the topic of user accounts, and allowing people to log in so they can save teams for later. I also think it would be interesting to see how this can be developed from a website to an app, providing a more accessible way to use the tool. Finally, I would like to implement alternative ways for users to import data such as via swimcloud, or a manual entry.

