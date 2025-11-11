# Medley Master Full Stack Website

## Overview

This site can be used to generate the fastest medley relay team for a given group of swimmers. Users can manually import their desired swimmers from the ASA rankings, and the website will do the rest.

A live demo of the site can be found at  [www.medleymaster.co.uk](https://www.medleymaster.co.uk/)

To read the full summary about this project, visit my [REPORT](REPORT.md)

The list of technologies used in this report are;
- Python
- PostgreSQL
- HTML
- CSS
- JavaScript

## Installation & Setup

I you wish to download and run this website locally, or just explore the files in this repository, follow these steps

- Clone repo 
    git clone https://github.com/nH0lmes/Relay_website.git

- Navigate to project folder
    cd Relay_website

- install backend dependencies
    pip install requirements.txt

Since the project uses a private SQL database, not all functions will run properly if run on your local machine. You should go to the live website listed above to see the live demo
## Project structure

static/      ### Frontend code
database/    ### Code for SQL database populating
python/      ### Backend code
