Defect Trend Remixed
Authors: Dave Thomas & Summer Ficarrotta
Last Modified: 12/14/2012

The problem we tried to solve here is analyzing "defect thrash". How many defects were re-opened after they were considered fixed, and how can we analyze those defects?

There are currently three components to this solution:
1. App.js provides "the big number" which is the number of defects that were re-opened over the specified time period. You can choose to lookback 30, 60, or 90 days
2. Table.js shows  details for defects that thrashed over the specified time period. Currently, the grid shows the defect id (which links to the defect details), the defect name, and the current defect state. Future versions will include columns for how many times the defect thrashed in the specified time. The app can run stand alone, or if it is on the same dashboard as "the big number" these two apps will drive each other's results. For example, if you change the time period for "the big number", the results in the grid will change to the same number.
3. Chart.js shows arrival/kill rates catogorized by arrival and kill type. For example, arrival could mean a new defect or from a re-opened defect and kill could mean closed or rejected. This app is incomplete but will work in concert with the big number app and grid app in the future.
