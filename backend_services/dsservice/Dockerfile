FROM python:3.11.4

WORKDIR /app

COPY dist/ds-service-1.0.tar.gz .

RUN pip install --no-cache-dir ds-service-1.0.tar.gz

EXPOSE 8010

CMD ["flask", "run", "--host=0.0.0.0", "--port=8010"]
