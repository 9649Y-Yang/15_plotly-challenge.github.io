// a function to collect infomation from metadata
function builtInfo(sampleID) {
    d3.json("samples.json").then((data) => {
        var metaDataAll = data.metadata;
        var metaData = metaDataAll.filter(object => object.id.toString() === sampleID);
        console.log(metaData);
        var infoSelector = d3.select("#sample-metadata");
        // clear original data
        infoSelector.html("");
        // append meatdata into the field
        metaData.forEach((data) => {
            Object.entries(data).forEach(([key, value]) => {
                infoSelector.append("p").text(`${key}: ${value}`);
            });
        });
    });
};

// a function to create bar chart and bubble chart
function buildPlot(sampleID) {
    // data for bar chart -- top 10 only
    d3.json("samples.json").then((data) => {
        var sampleDataAll = data.samples;
        var sampleData = sampleDataAll.filter(object => object.id === sampleID);
        console.log(sampleData);
        var sortedByValues = sampleData.sort((a, b) => b.sampleValues - a.sampleValues);
        console.log(sortedByValues);
        var slicedSampleData = sortedByValues[0].sample_values.slice(0,10).reverse();
        console.log(slicedSampleData);
        var slicedSampleID = sortedByValues[0].otu_ids.slice(0,10).reverse();
        console.log(slicedSampleID);
        var slicedSampleIDText = slicedSampleID.map(element => `OTU ${element}`);
        console.log(slicedSampleIDText);
        var sliceSampleLabel = sortedByValues[0].otu_labels.slice(0,10).reverse();
        console.log(sliceSampleLabel);
        // Trace for sample data for bar chart
        var traceBar = {
            x: slicedSampleData,
            y: slicedSampleIDText,
            text: sliceSampleLabel,
            type: "bar",
            orientation: "h"
        };
        // data for bar chart
        var dataBar = [traceBar];
        // Apply the group bar mode to the layout
        var layoutBar = {
            margin: {
            l: 150,
            r: 50,
            t: 0,
            b: 50
            }
        };
        Plotly.newPlot("bar", dataBar, layoutBar);

        // data for bubble chart -- all data required
        var sampleValueBubble = sampleData[0].sample_values;
        var sampleIDBubble = sampleData[0].otu_ids;
        console.log(sampleIDBubble);
        var sampleLabelBubble = sampleData[0].otu_labels;
        // Trace for sample data for bubble chart
        var traceBubble = {
            x: sampleIDBubble,
            y: sampleValueBubble,
            text: sampleLabelBubble,
            mode: "markers",
            marker: {
                size: sampleValueBubble,
                color: sampleIDBubble
            }
        };
        // data for bubble chart
        var dataBubble = [traceBubble];
        var layoutBubble = {
            margin: {
            t: 0
            },
            xaxis: {title: "OTU ID"},
        };
        Plotly.newPlot("bubble", dataBubble, layoutBubble);


        // bonus part for gauge chart
        var metaDataAll = data.metadata;
        var metaData = metaDataAll.filter(object => object.id.toString() === sampleID);
        // get the wash frequency from metadata
        var wfreq = metaData[0].wfreq;
        console.log(wfreq); 
        // some samples the wash frequency is null, set these to 0
        if (wfreq === null) {
            wfreq = 0;
        };
        // As wash frequency will be 0-9, and the gauge chart is half circle, each option will be wfreq*180/10
        var needleDegree = 180 -  wfreq*180/10;
        // convert degree to radians
        var needleRadians = needleDegree*Math.PI/180;
        // calculate where the needle end will point to
        var x = 0.5*Math.cos(needleRadians);
        var y = 0.5*Math.sin(needleRadians);       
        var ax = 0.0;
        var ay = 0.035;
        console.log(x, y);
        //create path for triangle needle
        var path = 
                'M ' + (-ax).toString() + ' ' + (-ay).toString() + 
                ' L ' + (ax).toString() + ' ' + (ay).toString() + 
                ' L ' + (x).toString() + ' ' + (y).toString() + 
                ' Z';
        console.log(path);

        // Trace for gauge chart
        var traceGauge = [
            // this is for the center/origin of needle
            {
            type: "scatter",
            x: [0],
            y: [0],
            marker: {
                size: 15,
                color: '#961717'
            },
            showlegend: false,
            name: "Wash Frequency",
            text: wfreq,
            hoverinfo: "text+name"
            },
            // gauge chart background
            {
                type: "pie",
                showlegend: false,
                hole: 0.5,
                rotation: 90,
                values: [180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180/9, 180],
                text: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1",""],
                direction: "anti-clockwise",
                textinfo: "text",
                textposition:'inside',
                textfont:{
                  size : 16,
                },
                marker: {colors: ['rgba(14, 127, 0, .5)', 'rgba(48, 140, 11, .5)', 'rgba(79, 147, 16, .5)', 'rgba(110, 154, 22, .5)', 'rgba(140, 178, 32, .5)','rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)', 'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)', 'rgba(255, 255, 255, 0)']},
                labels: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1",""],
                hoverinfo: "text"
            }
        ];
        // set up for layout
        var layout = {
            shapes:[{
                type: 'path',
                path: path,
                fillcolor: '#961717',
                line: {
                  color: '#961717'
                }
              }],
        
            title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
            height: 550,
            width: 550,
            xaxis: {zeroline:false, showticklabels:false,
                       showgrid: false, range: [-1, 1]},
            yaxis: {zeroline:false, showticklabels:false,
                       showgrid: false, range: [-1, 1]},
        };
        Plotly.newPlot("gauge", traceGauge, layout, {responsive: true});
    });
};


// create an initial sample data
function init() {
    // Choose the selector in html part
    var sampleSelector =  d3.select("#selDataset");
    // Use the D3 library to read in samples.json, fill in the id into dropdown menu
    d3.json("samples.json").then((data) => {
        // Get sample names from names in the data
        var sampleNames = data.names;
        sampleNames.forEach((sample) => {
            // append these sample names into the selector
            sampleSelector.append("option").text(sample);
        });   
        // Use the first one in the name as daulf initial option
        var initSample = sampleNames[0];
        console.log(initSample);
        buildPlot(initSample);
        builtInfo(initSample);
    });
};

// whenever select another sample will update information and charts
function optionChanged(newSample) {
    buildPlot(newSample);
    builtInfo(newSample);
};

init();

