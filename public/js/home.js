(function ($) {
  'use strict';

  var countdownTime = '';

  $('.navbar').removeClass('active');

  $(document).scroll(function (e) {
    if ($(document).scrollTop() >= $(window).height() - 70) {
      $('.navbar').addClass('active');
    } else {
      $('.navbar').removeClass('active');
    }
  });

  var start = new Date(Date.UTC(2016, 3, 15, 11, 0, 0));
  var countdown = $('.countdown-clock').countdown(start);

  countdown.on('update.countdown', function (clock) {
    countdownTime = '';
    console.log(clock);
    console.log(clock.strftime('%D '));

    countdownTime += clock.strftime('%D ');
    countdownTime += '<span class="days">';
    countdownTime += clock.strftime('day%!d');
    countdownTime += '</span> ';
    countdownTime += clock.strftime('%H:%M:%S');

    $(this).html(countdownTime);
  });

  countdown.on('finish.countdown', function () {
    $('.countdown').hide();
    // $('.buy-tickets').fadeIn(200);
  });
  $('.buy-tickets').fadeIn(2000);
}(window.jQuery));
