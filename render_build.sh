#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

python3 -m venv .venv
. .venv/bin/activate
pip install --upgrade pip
pip install pipenv

pipenv install

pipenv run upgrade
