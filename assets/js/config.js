// Configuration options
const init_phones = ["∆ Target"],// Optional. Which graphs to display on initial load. Note: Share URLs will override this set
      DIR = "data/",                                // Directory where graph files are stored
      default_channels = ["L","R"],                 // Which channels to display. Avoid javascript errors if loading just one channel per phone
      default_normalization = "Hz",                 // Sets default graph normalization mode. Accepts "dB" or "Hz"
      default_norm_db = 60,                         // Sets default dB normalization point
      default_norm_hz = 630,                        // Sets default Hz normalization point (500Hz is recommended by IEC)
      max_channel_imbalance = 5,                    // Channel imbalance threshold to show ! in the channel selector
      alt_layout = true,                            // Toggle between classic and alt layouts
      alt_sticky_graph = true,                      // If active graphs overflows the viewport, does the graph scroll with the page or stick to the viewport?
      alt_animated = true,                          // Determines if new graphs are drawn with a 1-second animation, or appear instantly
      alt_header = true,                            // Display a configurable header at the top of the alt layout
      alt_tutorial = true,                          // Display a configurable frequency response guide below the graph
      site_url = '/',                               // URL of your graph "homepage"
      share_url = true,                             // If true, enables shareable URLs
      watermark_text = "IEC711 Clone",              // Optional. Watermark appears behind graphs
      watermark_image_url = "assets/images/copland.svg", // Optional. If image file is in same directory as config, can be just the filename
      page_title = "Camille's Audio Database",                  // Optional. Appended to the page title if share URLs are enabled
      page_description = "View in-ear monitor & headphone measurements",
      accessories = true,                           // If true, displays specified HTML at the bottom of the page. Configure further below
      externalLinksBar = false,                      // If true, displays row of pill-shaped links at the bottom of the page. Configure further below
      expandable = false,                           // Enables button to expand iframe over the top of the parent page
      expandableOnly = false,                       // Prevents iframe interactions unless the user has expanded it. Accepts "true" or "false" OR a pixel value; if pixel value, that is used as the maximum width at which expandableOnly is used
      headerHeight = '0px',                         // Optional. If expandable=true, determines how much space to leave for the parent page header
      darkModeButton = true,                        // Adds a "Dark Mode" button the main toolbar to let users set preference
      targetDashed = true,                          // If true, makes target curves dashed lines
      targetColorCustom = false,                    // If false, targets appear as a random gray value. Can replace with a fixed color value to make all targets the specified color, e.g. "black"
      labelsPosition = "bottom-left",               // Up to four labels will be grouped in a specified corner. Accepts "top-left," bottom-left," "bottom-right," and "default"
      stickyLabels = true,                          // "Sticky" labels 
      analyticsEnabled = false,                     // Enables Google Analytics 4 measurement of site usage
      extraEnabled = true,                          // Enable extra features
      extraUploadEnabled = true,                    // Enable upload function
      extraEQEnabled = true,                        // Enable parametic eq function
      extraEQBands = 10,                            // Default EQ bands available
      extraEQBandsMax = 20;                         // Max EQ bands available

// Specify which targets to display
const targets = [
    { type:"Reference", files:["∆", "JM-1", "Diffuse Field"] },
    { type:"Community",    files:["IEF Compensation", "IEF 2023 Adjusted"] },
    { type:"Preference", files:["Harman In-Ear (2019)","Harman In-Ear (2017)"] }
];

// Haruto's Addons
const  preference_bounds = "assets/images/bounds.png", // Preference bounds image
       PHONE_BOOK = "phone_book.json",                 // Path to phone book JSON file
       default_DF_name = "∆",                       // Default RAW DF name
       dfBaseline = true,                              // If true, DF is used as baseline when custom df tilt is on
       default_bass_shelf = 0,                         // Default Custom DF bass shelf value
       default_tilt = -1,                            // Default Custom DF tilt value
       default_ear = 0,                                // Default Custom DF ear gain value
       default_treble = 0,                             // Default Custom DF treble gain value
       tiltableTargets = ["∆","JM-1","Diffuse Field"];  


// *************************************************************
// Functions to support config options set above; probably don't need to change these
// *************************************************************

// But I will anyways haha - Haruto

// Set up the watermark, based on config options above
function watermark(svg) {
    let wm = svg.append("g")
        .attr("transform", "translate("+(pad.l+W/2)+","+(pad.t+H/2-20)+")")
        .attr("opacity",.25);
    
     if ( watermark_image_url ) {
        wm.append("image")
            .attrs({id:'logo', x:318, y:-136, width:60, height:60, "xlink:href":watermark_image_url});
    }
    
    if ( watermark_text ) {
        wm.append("text")
            .attrs({x:3, y:160, "font-size":14, "text-anchor":"middle", "class":"graph-name"})
            .text(watermark_text)
            .attr("opacity",.48);
    }

    if ( preference_bounds ) {
        wm.append("image")
        .attrs({id:'bounds',x:-385, y:-365, width:770, height:770, "xlink:href":preference_bounds, "display":"none"});
    }
    
    let wmSq = svg.append("g")
        .attr("opacity",0.2);
    
    wmSq.append("image")
        .attrs({x:652, y:254, width:100, height:94, "class":"", "xlink:href":""});
    
    wmSq.append("text")
        .attrs({x:763, y:319, "font-size":10, "transform":"translate(0,0)", "text-anchor":"end", "class":"wm-squiglink-address"})
        .text("");

    // Extra flair
    svg.append("g")
        .attr("opacity",0.2)
        .append("text")
        .attrs({x:765, y:314, "font-size":10, "text-anchor":"end", "class":"site_name"})
        .text("graphtool.layer7.me");
}



// Parse fr text data from REW or AudioTool format with whatever separator
function tsvParse(fr) {
    return fr.split(/[\r\n]/)
        .map(l => l.trim()).filter(l => l && l[0] !== '*')
        .map(l => l.split(/[\s,]+/).map(e => parseFloat(e)).slice(0, 2))
        .filter(t => !isNaN(t[0]) && !isNaN(t[1]));
}



// Apply stylesheet based layout options above
function setLayout() {
    function applyStylesheet(styleSheet) {
        var docHead = document.querySelector("head"),
            linkTag = document.createElement("link");
        
        linkTag.setAttribute("rel", "stylesheet");
        linkTag.setAttribute("type", "text/css");
        
        linkTag.setAttribute("href", styleSheet);
        docHead.append(linkTag);
    }

    if ( !alt_layout ) {
        applyStylesheet("assets/css/style.css");
    } else {
        applyStylesheet("assets/css/style-alt.css");
        applyStylesheet("assets/css/style-alt-theme.css");
    }
}
setLayout();



// Configure HTML accessories to appear at the bottom of the page. Displayed only if accessories (above) is true
// There are a few templates here for ease of use / examples, but these variables accept any HTML
const 
    // Short text, center-aligned, useful for a little side info, credits, links to measurement setup, etc. 
    simpleAbout = `
        <p class="center">This graph database is maintained by HarutoHiroki with frequency responses generated via an "IEC60318-4"-compliant ear simulator. This web software is based on the <a href="https://github.com/mlochbaum/CrinGraph">CrinGraph</a> open source software project, with <a href="https://www.teachmeaudio.com/mixing/techniques/audio-spectrum">Audio Spectrum</a>'s definition source.</p>
    `,
    // Which of the above variables to actually insert into the page
    whichAccessoriesToUse = simpleAbout;

// Set up analytics
function setupGraphAnalytics() {
    if ( analyticsEnabled ) {
        const pageHead = document.querySelector("head"),
              graphAnalytics = document.createElement("script"),
              graphAnalyticsSrc = "graphAnalytics.js";
        
        graphAnalytics.setAttribute("src", graphAnalyticsSrc);
        pageHead.append(graphAnalytics);
    }
}
setupGraphAnalytics();



// If alt_header is enabled, these are the items added to the header
let headerLogoText = "",
    headerLogoImgUrl = "assets/images/text-logo.png",
    headerLinks = [
    {
        name: "About",
        url: "https://github.com/camille-7/PublicGraphTool/blob/main/README.md"
    },
    {
        name: "Reccomendations",
        url: "https://github.com/camille-7/txt-files/blob/main/product-reccomendations.md"
    }
//  {
//      name: "GitHub",
//      url: "https://github.com/HarutoHiroki"
//  },
];

let tutorialDefinitions = [
    {
        name: 'Sub bass',
        width: '16%',
        description: 'The Rumble™: Not much melodic or tonal content here, save for the fundamentals of the lowest notes on a piano, synth, or bass guitar. Kick drums and floor toms often also have fundamental energy here. Too much makes the sound unrealistically "big," while too little results in lacking weight or sense of tactility.'
    },
    {
        name: 'Bass',
        width: '20.6%',
        description: 'Fundamental frequencies of many sounds. Drums, pianos, guitars, vocals, strings, horns, and woodwinds. Reduced energy here can make the sound lean and cold, but also add clarity. Too much here can make the sound overly resonant, boomy, lumpy, swollen, or muddy... but it can also make the sound warm, inviting, or rich.'
    },
    {
        name: 'Lower Mids',
        width: '10.1%',
        description: 'Low order harmonics of most instruments. Boosting this region brings forth for the boxy overtones of bass, while perhaps giving more body to instruments like flute or violin. Cutting in this region can bring clarity to kick drums, as well as help guitars sound less claustrophobic.'
    },
    {
        name: 'Midrange',
        width: "10%",
        description: 'The midrange can determine how prominent an instrument is in the overall mix, in fact boosts in this area can be conflated with things overall being "louder". Boosting around 800 Hz can give instruments a horn-like quality, as horns naturally tend to have the bulk of their energy around here. Excess output at this range can sound honky and may cause ear fatigue.'
    },
    {
        name: 'Upper Mids',
        width: "20%",
        description: 'Likely the most critical band of audio. The upper midrange is responsible for the percussive attack, intelligibility, texture, forwardness, and character of almost every instrument and voice. If boosted, this range can add any of these things, but pushing it too far can lead to things being overly-textured or harsh. Too little energy here makes the sound blunted or unintelligible.'
    },
    {
        name: 'Presence',
        width: '5.9%',
        description: 'The presence range serves as the transition region between upper midrange and treble, and as such it shares aspects typical to either of them. It contains both intelligibility and clarity cues, as well as textural harmonics. Over-boosting can cause a scratchy, grainy sound. Cutting in this range can reduce those aspects, at the cost of making things less textured and more distant.'
    },
    {
        name: 'Treble',
        width: '17.4%',
        description: 'The danger zone. This is where we find the stringy, splashy bits of sound. The detail of a plucked acoustic guitar, the shimmer of a hardly-struck piano, the—at times sibilant, whispery—air of voices, the sheen of strings and the breath of woodwinds and horns. Too much can make things sound thin and weightless, while too little can make things sound blurred or smeared.'
    }
]

// o == offset
// l ==
// p == phone
// id == name
// lr == default curve
// v == valid channels
/*
let phoneObj = {
                    isTarget: false,
                    brand: "Average",
                    dispName: "All SPL",
                    phone: "All SPL",
                    fullName: "Average All SPL",
                    fileName: "Average All SPL",
                    rawChannels: "R",
                    isDynamic: false,
                    id: "AVG"
                };
*/