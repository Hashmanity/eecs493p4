var galleryMode = false;
var slideShowInterval;
var currentDate;
var dateOffset = 1;
var currentSlide = 0;
var startDate;
var idList = [];
var errorImages = [
    "https://web.eecs.umich.edu/~ackerm/exception-images/exception1.jpg",
    "https://web.eecs.umich.edu/~ackerm/exception-images/exception2.jpg"
];


var KEYS = {
    one: 49,
    two: 50,
    three: 51,
    five: 53,
    seven: 55,
    nine: 57
}

/// Functional Code ///
// https://blog.revathskumar.com/2016/06/why-i-prefer-ajax-promise.html


// Main
$(document).ready( function() {
    console.log("Ready!");
    startDate = getFormattedDate(dateOffset);
    currentDate = startDate;
    getInterestingImages(currentDate);
    $("#myCarousel").carousel({
        interval: 5000,
    });
    $(window).keydown(keydownRouter);
});

function getInterestingImages(date_in) {
    let textDate = date_in;
    $.ajax({
        url: "https://api.flickr.com/services/rest",
        type: "GET",
        data: {
            method: "flickr.interestingness.getList",
            api_key: "ace69d5a68863feaef191c820d2d4179",
            date: textDate,
            per_page: 10,
            format: "json",
            nojsoncallback: 1,
        }
    }) // AJAX
    .then(response => {
        console.log(response);
        // Go through each photo in the json
       $.each(response.photos.photo, function (i, photo) {
            var src = "https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_c.jpg";

            let active;
            if (i == 0)
            active = " active";
            else
                active = '';

            // Create the img html and set the src attribute to our URL
            let imgHtml = $("<img/>").attr("src", src);

            // Create the .item div and insert the img html into it
            // This is better done in css
            let itemDivHtml = $("<div id=" + photo.id + " class='item" + active + "' width='460' height='345'/>").append(imgHtml);

            // Insert the .item div into the .carousel-inner div
            $(".carousel-inner").append(itemDivHtml);
        })
        $("#label").text("Interestingness: " + textDate);
    }) // then
    .catch(error => {
        console.log("Error!!")
    });
}


function keydownRouter(e) {
    switch (e.which) {
        case KEYS.one:
            startOver();
            break;
        
        case KEYS.two:
            switchToCarousel();
            break;
        
        case KEYS.three:
            generateNewSet();
            break;
        
        case KEYS.five:
            let currentImageID = $('.item.active').attr("id");
            switchtoGallery(currentImageID);
            break;

        case KEYS.seven:
            console.log("pausing");
            $("#myCarousel").carousel("pause");
            break;
        
        case KEYS.nine:
            console.log("resuming");
            $("#myCarousel").carousel("cycle");
            break;

        default:
            console.log("Invalid key input");
    }
}

function startOver() {
    console.log("reverting back to the start");
    // Remove elements
    $('.item').remove();
    dateOffset = 1;
    getInterestingImages(startDate);
}

function switchToCarousel() {
    galleryMode = false;
    console.log("reverting back to our carousel");
    
    // Remove elements
    $('.item').remove();
    getInterestingImages(currentDate);
}

function generateNewSet() {
    dateOffset++;
    
    // Remove elements
    $('.heading').remove();
    $('.item').remove();
    currentDate = getFormattedDate(dateOffset);
    getInterestingImages(currentDate);
}

function getGalleryInfo(imageID) {
    console.log("getting gallery information");
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://api.flickr.com/services/rest",
            type: "GET",
            data: {
                method: "flickr.galleries.getListForPhoto",
                api_key: "ace69d5a68863feaef191c820d2d4179",
                photo_id: imageID,
                per_page: 10,
                format: "json",
                nojsoncallback: 1,
            },
            success: function(data) {
                resolve(data);
            },
            error: function(error) {
                reject(error)
            },
        })
    })
}
    

function switchtoGallery(imageID) {
    getGalleryInfo(imageID)
        .then(response => {
            return response.galleries.gallery[0].gallery_id
        })
        .then(response => {
            let galleryID = response;
            console.log(galleryID);
            let new_data = $.ajax({
                url: "https://api.flickr.com/services/rest",
                type: "GET",
                data: {
                    method: "flickr.galleries.getPhotos",
                    api_key: "ace69d5a68863feaef191c820d2d4179",
                    gallery_id: galleryID,
                    per_page: 10,
                    format: "json",
                    nojsoncallback: 1,
                } 
            })
            return new_data;
        })
        .then(response => {
            console.log("got the gallery images from the api call, now to render them");

            $('.item').remove();

            $.each(response.photos.photo, function (i, photo) {
                var src = "https://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_c.jpg";
    
                let active;
                if (i == 0)
                active = " active";
                else
                    active = '';
    
                // Create the img html and set the src attribute to our URL
                let imgHtml = $("<img/>").attr("src", src);
    
                // Create the .item div and insert the img html into it
                // This is better done in css
                let itemDivHtml = $("<div id=" + photo.id + " class='item" + active + "' width='460' height='345'/>").append(imgHtml);
    
                // Insert the .item div into the .carousel-inner div
                $(".carousel-inner").append(itemDivHtml);

                // Loop until 10 images
                if (i === 9) {
                    return false;
                }
            })
            $("#label").text("Gallery View");
        })
        .catch(error => {
            console.log("no gallery found, rendering michigan photos");
            renderErrorImages();
        })
}


function renderErrorImages() {
    $('.item').remove();
    let active;

    for (let i = 0; i < errorImages.length; i++) {
        if (i == 0) {
        active = " active";
        } else {
        active = "";
        }

        // Create the img html and set the src attribute to our URL
        let imgHtml = $("<img/>").attr("src", errorImages[i]);

        // Create the .item div and insert the img html into it
        // This is better done in css
        let itemDivHtml = $("<div class='item" + active + "' width='460' height='345'/>").append(imgHtml);
        $(".carousel-inner").append(itemDivHtml);
        $("#label").text("");

    }
}


function getFormattedDate(offset) {
    date = new Date();
	date.setDate(date.getDate() - offset);
	month = '' + (date.getMonth() + 1),
    day = '' + date.getDate(),
    year = date.getFullYear();
	if (month.length < 2) {
        month = '0' + month;
    }
    if (day.length < 2) {
        day = '0' + day;
    }
	formatted_date = year + "-" + month + "-" + day;
    formatted_date.toString();
    return formatted_date;
}