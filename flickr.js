var galleryMode = false;
var slideShowInterval;
var currentDate;
var dateOffset = 1;
var currentSlide = 0;
var startDate;
var idList = [];


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
// ace69d5a68863feaef191c820d2d4179
// e42514e058197300
// cycle pause cycle

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
            idList.push(photo.id);
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
            console.log(currentImageID);
            switchtoGallery(currentImageID);
            break;

        case KEYS.seven:
            $("#myCarousel").carousel("pause");
            break;
        
        case KEYS.nine:
            $("#myCarousel").carousel("cycle");
            break;

        default:
            console.log("Invalid key input");
    }
}

function startOver() {
    console.log("reverting back to the start");
    // Remove elements
    $('.heading').remove();
    $('.item').remove();
    getInterestingImages(startDate);
}

function switchToCarousel() {
    galleryMode = false;
    console.log("reverting back to our carousel");
    
    // Remove elements
    $('.heading').remove();
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

function switchtoGallery(imageID) {
    console.log("getting gallery");
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
        }
    }) // AJAX
    .then(response => {
        return response.galleries.gallery[0].gallery_id;
    }) // then first

    .then(response => {
        let galleryID = response;
        console.log(galleryID);
        $.ajax({
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
        }) // AJAX
        .then(response => {
            console.log("got the gallery images now");
            console.log(response);
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
                let itemDivHtml = $("<div class='item" + active + "' width='460' height='345'/>").append(imgHtml);
    
                // Insert the .item div into the .carousel-inner div
                $(".carousel-inner").append(itemDivHtml);
            })
        }) // nested then
    }) // then second
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