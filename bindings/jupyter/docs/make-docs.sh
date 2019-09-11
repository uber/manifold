#!/bin/bash
jupyter nbconvert --to html ../notebooks/*.ipynb
jupyter nbconvert --to markdown ../notebooks/*.ipynb
mv ../notebooks/*.html .
mv ../notebooks/*.md .
