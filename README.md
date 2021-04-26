# Pytest Coverage Commentator

A Github action to comments a Pytest Coverage on PR from pytest-cov xml output. Please note: this action only available on pull request.

## GitHub Action

The following is an example GitHub Action workflow that uses the Pytest Coverage Commentator to extract the coverage to comment at pull request. Here is an example setup of this action:

```yaml
name: pytest-coverage-commentator
on:
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python 3.8
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install flake8 pytest pytest-cov
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
    - name: Build coverage file
      run: |
        pytest --cache-clear --cov=app --cov-report xml test/
    - name: Comment coverage
      uses: highspeedoffice/pytest-cov-xml-parser@v1
```

## Action Input


Variable          | Default                                               | Purpose
------------------|-------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------
file   | `coverage.xml`                                 | Output file of pytest-cov in XML format used to generate the comment.
token  | `${{ github.token }}` | Token used to add/edit comments