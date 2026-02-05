#!/usr/bin/env bash

which -s brew
if [[ $? != 0 ]]; then
    echo "Installing Homebrew"
  # Install Homebrew
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
fi

which -s hadolint
if [[ $? != 0 ]]; then
    echo "Installing Hadolint"
  # Install Hadolint
  brew install hadolint
fi