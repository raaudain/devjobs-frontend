FROM python:3-alpine

WORKDIR /code

COPY . /code

RUN pip install --upgrade pip
RUN pip install --upgrade -r /code/requirements.txt
