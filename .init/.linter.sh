#!/bin/bash
cd /home/kavia/workspace/code-generation/secure-password-manager-139254-139281/password_manager_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

