#!/bin/bash
#
# Utility launch to build all apps in DEBUG mode for Defect Rework dashboard.
#
# Usage: ./debug.sh       -- no arguments

rake debug['DefectReworkChart']
rake debug['DefectReworkTable']
rake debug['DefectReworkCount']

exit 0
