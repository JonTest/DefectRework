#!/bin/bash
#
# Utility to build all apps for Defect Rework dashboard.  Copies each
# built app into top-level deploy directory.
#
# Usage: ./build.sh

ROOT_DIR=$(dirname $0)
SRC_DIR=${ROOT_DIR}/src
DEPLOY_DIR=${ROOT_DIR}/deploy

# Build all apps; assumes dir name starts with 'DefectRework'
for app_dir in $(find ${SRC_DIR} -name "DefectRework*" -type d); do
  app_name=$(basename $app_dir)
  echo "**[ ${app_name} ]**"
  cd ${app_dir};
  rake build
  echo "> Copied to global deploy/${app_name}.html"
  cp deploy/App.html ../../${DEPLOY_DIR}/${app_name}.html
  cd -
done;

exit 0
