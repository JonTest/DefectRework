#!/bin/bash
#
# Utility launch to build all apps for Defect Rework dashboard.
#
# Usage: ./build.sh       -- no arguments

rake build['DefectReworkChart']
rake build['DefectReworkTable']
rake build['DefectReworkCount']

exit 0
