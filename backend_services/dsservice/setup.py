from setuptools import setup, find_packages

install_requires = [
    'aiohappyeyeballs==2.4.3',
    'aiohttp==3.11.7',
    'aiosignal==1.3.1',
    'annotated-types==0.7.0',
    'anyio==4.6.2.post1',
    'attrs==24.2.0',
    'blinker==1.9.0',
    'certifi==2024.8.30',
    'charset-normalizer==3.4.0',
    'click==8.1.7',
    'colorama==0.4.6',
    'dataclasses-json==0.6.7',
    'distro==1.9.0',
    'filelock==3.16.1',
    'Flask==3.1.0',
    'frozenlist==1.5.0',
    'fsspec==2024.10.0',
    'greenlet==3.1.1',
    'h11==0.14.0',
    'httpcore==1.0.7',
    'httpx==0.27.2',
    'httpx-sse==0.4.0',
    'huggingface-hub==0.26.2',
    'idna==3.10',
    'itsdangerous==2.2.0',
    'Jinja2==3.1.4',
    'jiter==0.8.0',
    'jsonpatch==1.33',
    'jsonpointer==3.0.0',
    'kafka-python==2.0.2',
    'langchain==0.3.8',
    'langchain-community==0.3.8',
    'langchain-core==0.3.21',
    'langchain-mistralai==0.2.2',
    'langchain-openai==0.2.10',
    'langchain-text-splitters==0.3.2',
    'langsmith==0.1.146',
    'MarkupSafe==3.0.2',
    'marshmallow==3.23.1',
    'multidict==6.1.0',
    'mypy-extensions==1.0.0',
    'numpy==1.26.4',
    'openai==1.55.1',
    'orjson==3.10.12',
    'packaging==24.2',
    'propcache==0.2.0',
    'pydantic==2.10.2',
    'pydantic-settings==2.6.1',
    'pydantic_core==2.27.1',
    'python-dotenv==1.0.1',
    'PyYAML==6.0.2',
    'regex==2024.11.6',
    'requests==2.32.3',
    'requests-toolbelt==1.0.0',
    'sniffio==1.3.1',
    'SQLAlchemy==2.0.35',
    'tenacity==9.0.0',
    'tiktoken==0.8.0',
    'tokenizers==0.20.4',
    'tqdm==4.67.1',
    'typing-inspect==0.9.0',
    'typing_extensions==4.12.2',
    'urllib3==2.2.3',
    'Werkzeug==3.1.3',
    'yarl==1.18.0'
]

setup(
    name='ds-service',
    version='1.0',
    packages=find_packages('src'),
    package_dir={'': 'src'},
    install_requires=install_requires,
    include_package_data=True,
)