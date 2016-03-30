(function ($, google) {
  'use strict';

  // NavBar
  $('.navbar-fixed-top').autoHidingNavbar({});

  // Map
  var point = new google.maps.LatLng(-34.892589, -56.194638);
  var map = new google.maps.Map(
    document.getElementById('map'),
    {
      center: point,
      zoom: 15,
      draggable: false,
      scrollwheel: false,
      panControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      styles: [
        {
          'featureType': 'water',
          'elementType': 'geometry',
          'stylers': [{
              'color': '#193341'
          }]
        }, {
          'featureType': 'landscape',
          'elementType': 'geometry',
          'stylers': [{
              'color': '#2c5a71'
          }]
        }, {
          'featureType': 'road',
          'elementType': 'geometry',
          'stylers': [{
              'color': '#29768a'
          }, {
              'lightness': -37
          }]
        }, {
          'featureType': 'poi',
          'elementType': 'geometry',
          'stylers': [{
              'color': '#406d80'
          }]
        }, {
          'featureType': 'transit',
          'elementType': 'geometry',
          'stylers': [{
              'color': '#406d80'
          }]
        }, {
          'elementType': 'labels.text.stroke',
          'stylers': [{
              'visibility': 'on'
          }, {
              'color': '#3e606f'
          }, {
              'weight': 2
          }, {
              'gamma': 0.84
          }]
        }, {
          'elementType': 'labels.text.fill',
          'stylers': [{
              'color': '#ffffff'
          }]
        }, {
          'featureType': 'administrative',
          'elementType': 'geometry',
          'stylers': [{
              'weight': 0.6
          }, {
              'color': '#1a3541'
          }]
        }, {
          'elementType': 'labels.icon',
          'stylers': [{
              'visibility': 'off'
          }]
        }, {
          'featureType': 'poi.park',
          'elementType': 'geometry',
          'stylers': [{
              'color': '#2c5a71'
          }]
        }
      ]
    }
  );

  var marker = new google.maps.Marker({
    position: point,
    icon: {
      // url: '/images/base/logo.png',
      url: 'https://s3.amazonaws.com/uploads.hipchat.com/32900/709766/VFJMcUpVNHsaq5O/main.png',
      size: new google.maps.Size(468, 468),
      scaledSize: new google.maps.Size(100, 100),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(50, 100)
    }
  });
  marker.setMap(map);

  // Tickets
  var $buyModal = $('#buy');
  var $attendeeModal = $('#attendee');

  var showError = function (err, exit) {
    if (exit) {
      $buyModal.modal('hide');
      $attendeeModal.modal('hide');
    }
    window.alert(err.message);
    return false;
  };

  var show = function (ticket, discount) {
    $buyModal.find('.indicator').removeClass('active');
    $buyModal.find('.indicator-select').addClass('active');
    $buyModal.find('.step').hide();
    $buyModal.find('.step-select > *').hide();
    $buyModal.find('.step-select .loading').show();
    $buyModal.find('.step-select').show();
    $buyModal.modal({
      backdrop: 'static',
      keyboard: false
    });

    $.get('/api/tickets/available', {ticket: ticket, discount: discount}, function (response) {
      if (response.error) {
        return showError(response.error, true);
      }
      $buyModal.find('.step-select .discount').hide();
      $buyModal.find('.step-select .tickets').hide();
      $buyModal.find('.step-select .soldout').hide();
      if (response.messages.invalidDiscount) {
        $buyModal.find('.step-select .discount').show().addClass('error').append(
          $('<span />').text('Invalid disocunt code')
        );
      } else if (response.discount) {
        $buyModal.find('.step-select .discount').show().removeClass('error').append(
          'Using ',
          response.discount.logo ? $('<img />').attr('src', response.discount.logo) : null,
          ' ',
          $('<strong />').text(response.discount.name),
          ' discount code'
        );
      }
      if (response.tickets.length) {
        $buyModal.find('.step-select .tickets ul').html('');
        response.tickets.forEach(function (ticket) {
          $('<li />')
            .append(
              $('<div />').addClass('name').append(
                ticket.logo ? $('<img />').attr('src', ticket.logo) : null,
                ' ',
                ticket.name
              )
            )
            .append(
              $('<div />').addClass('buy').append(
                $('<del />').text(ticket.price != ticket.retail ? 'USD ' + ticket.retail : ''),
                $('<input type="number" />').attr('min', ticket.min).attr('max', ticket.max).val(ticket.min),
                $('<button />').text(ticket.price ? ' x ' + ticket.price + ' USD' : ' x Free').click(function (e) {
                  select(ticket.code, response.discount && response.discount.code, $(this).parent().find('input').val());
                })
              )
            )
            .appendTo($buyModal.find('.step-select .tickets ul'));
        });
        $buyModal.find('.step-select .tickets').show();
      } else {
        $buyModal.find('.step-select .soldout').show();
      }
      $buyModal.find('.step-select .description').show();
      $buyModal.find('.step-select .order').show();
      $buyModal.find('.step-select .note').show();
      $buyModal.find('.step-select .loading').hide();
    });
  };

  var select = function (ticket, discount, quantity) {
    $buyModal.find('.indicator').removeClass('active');
    $buyModal.find('.indicator-select').addClass('active');
    $buyModal.find('.indicator-payment').addClass('active');
    $buyModal.find('.step').hide();
    $buyModal.find('.step-payment > *').hide();
    $buyModal.find('.step-payment .loading').show();
    $buyModal.find('.step-payment').show();
    $buyModal.modal({
      backdrop: 'static',
      keyboard: false
    });
    $.post('/api/tickets/select', {ticket: ticket, discount: discount, quantity: quantity}, function (response) {
      if (response.error) {
        return showError(response.error, true);
      } else {
        if (response.order.quantity === 0) {
          show(window.jsconfuy.ticket, window.jsconfuy.discount);
          return showError('Try again please.', false);
        } else {
          window.jsconfuy.order = response.order.id;
          $buyModal.find('.step-payment .invoice .detail .description').text(
            response.order.quantity + ' × ' + response.order.ticket +
            (response.order.price ? ' ($ ' + response.order.price + ')' : '')
          );
          $buyModal.find('.step-payment .invoice .detail .total').text(
            response.order.total ? '$ ' + response.order.total : 'Free'
          );
          $buyModal.find('.step-payment > *').show();
          $buyModal.find('.step-payment .loading').hide();
          if (response.order.total === 0) {
            $buyModal.find('.step-payment .payment').hide();
            $buyModal.find('.step-payment .pay').hide();
            $buyModal.find('.step-payment .continue').show();
            $buyModal.find('.step-payment .continue button').text('Continue');
          } else {
            $buyModal.find('.step-payment .payment').show();
            $buyModal.find('.step-payment .continue').hide();
            $buyModal.find('.step-payment .pay').show();
            $buyModal.find('.step-payment .pay button').text('Pay $ ' + response.order.total + ' USD');
          }
        }
      }
    });
  };

  var assign = function (order) {
    $buyModal.find('.indicator').removeClass('active');
    $buyModal.find('.indicator-select').addClass('active');
    $buyModal.find('.indicator-payment').addClass('active');
    $buyModal.find('.indicator-assign').addClass('active');
    $buyModal.find('.step').hide();
    $buyModal.find('.step-assign > *').hide();
    $buyModal.find('.step-assign .loading').show();
    $buyModal.find('.step-assign').show();
    $buyModal.modal({
      backdrop: 'static',
      keyboard: false
    });
    $.get('/api/tickets/assign', {order: order}, function (response) {
      if (response.error) {
        return showError(response.error, true);
      } else {
        window.jsconfuy.order = response.order.id;
        $buyModal.find('.step-assign .attendees ul').empty();
        response.attendees.forEach(function (attendee, index) {
          var li = $('<li />')
            .attr('id', attendee.id)
            .append(
              $('<div class="name" />').text(attendee.name || 'Please register the attendee.'),
              $('<div class="reference" />').text('#' + attendee.reference)
            ).click(function (e) {
              fill(attendee.id);
            });
          $buyModal.find('.step-assign .attendees ul').append(li);
        });
        $buyModal.find('.step-assign .info a.reference').attr('href', '/?ref=' + response.order.reference).text('#' + response.order.reference);
        $buyModal.find('.step-assign .info a.receipt').attr('href', '/receipts/' + response.order.reference)
        $buyModal.find('.step-assign .info a.print').attr('href', '/print/' + response.order.reference)
        $buyModal.find('.step-assign .link a').attr('href', '/?ref=' + response.order.reference)
        $buyModal.find('.step-assign > *').show();
        $buyModal.find('.step-assign .loading').hide();
      }
    });
  };

  var fill = function (attendee) {
    $.get('/api/tickets/fill', { attendee: attendee }, function (response) {
      if (response.error) {
        return showError(response.error, true);
      } else {
        window.jsconfuy.attendee = attendee;
        $attendeeModal.find('input[name=name]').val(response.attendee.name);
        $attendeeModal.find('input[name=email]').val(response.attendee.email);
        $attendeeModal.find('select[name=tshirt]').val(response.attendee.tshirt);
        $attendeeModal.find('textarea[name=extra]').val(response.attendee.extra);
        $attendeeModal.find('input[name=workshop]').prop('checked', false);
        response.attendee.workshops.forEach(function (workshop) {
          $attendeeModal.find('input[name=workshop][value=' + workshop + ']').prop('checked', true);
        });
        $attendeeModal.find('.link a').attr('href', '/?ref=' + response.attendee.reference)
        $attendeeModal.find('.info a.reference').attr('href', '/?ref=' + response.attendee.reference).text('#' + response.attendee.reference);
        $attendeeModal.find('.info a.print').attr('href', '/print/' + response.attendee.reference)
        $attendeeModal.modal({
          backdrop: 'static',
          keyboard: false
        });
      }
    });
  };

  var save = function () {
    var data = {
      id: window.jsconfuy.attendee,
      name: $attendeeModal.find('input[name=name]').val(),
      email: $attendeeModal.find('input[name=email]').val(),
      tshirt: $attendeeModal.find('select[name=tshirt]').val(),
      extra: $attendeeModal.find('textarea[name=extra]').val(),
      workshops: $attendeeModal.find('input[name=workshop]:checked').map(function() {return this.value;}).get()
    };

    if (/^\s*$/.test(data.name)) {
      $attendeeModal.find('input[name=name]').focus();
      return;
    };

    if (!/@/.test(data.email)) {
      $attendeeModal.find('input[name=email]').focus();
      return;
    };

    $.post('/api/tickets/save', data, function (response) {
      if (response.error) {
        return showError(response.error, true);
      } else {
        $buyModal.find('#' + window.jsconfuy.attendee).find('.name').text(data.name);
        $attendeeModal.modal('hide');
      }
    });
  };

  $buyModal.find('.step-payment .continue button').click(function (e) {
    var order = window.jsconfuy.order;
    var $name = $buyModal.find('.step-payment .name input');
    var $email = $buyModal.find('.step-payment .email input');
    var name = $name.val().trim();
    var email = $email.val().trim();

    if (/^\s*$/.test(name)) {
      $name.focus();
      return;
    };

    if (!/@/.test(email)) {
      $email.focus();
      return;
    };

    $.post('/api/tickets/details', {order: order, name: name, email: email}, function (response) {
      if (response.error) {
        return showError(response.error, false);
      }
      assign(order);
    });

    return false;
  });

  $buyModal.find('.step-payment .pay button').click(function (e) {
    var order = window.jsconfuy.order;
    var $name = $buyModal.find('.step-payment .name input');
    var $email = $buyModal.find('.step-payment .email input');
    var name = $name.val().trim();
    var email = $email.val().trim();

    if (/^\s*$/.test(name)) {
      $name.focus();
      return;
    };

    if (!/@/.test(email)) {
      $email.focus();
      return;
    };

    var purchase = function () {
      var windowTimeout;

      window.purchaseCompleted = function (err) {
        window.clearTimeout(windowTimeout);
        if (err) {
          showError(err, true);
        } else {
          assign(order);
        }
      };

      var purchaseWindow = window.open('/purchase/' + order, 'Payment', 'scrollbars=1,height=550,width=800');
      windowTimeout = window.setTimeout(function () {
        window.setTimeout(function () {
          window.alert('Your reservation expired');
        }, 10); // Prevent FF hangs
        purchaseWindow.close();
        show(window.jsconfuy.ticket, window.jsconfuy.discount);
      }, window.jsconfuy.reservation * 60 * 1000); // X minutes

      if (window.focus && purchaseWindow) {
        purchaseWindow.focus();
      }
    };

    $.post('/api/tickets/details', {order: order, name: name, email: email}, function (response) {
      if (response.error) {
        return showError(response.error, false);
      }
      purchase();
    });

    return false;
  });

  $buyModal.find('.step-assign .save button').click(function (e) {
    $buyModal.modal('hide');
  });

  $attendeeModal.find('.save button').click(function (e) {
    save();
  });

  $('*[data-buy]').click(function (e) { show(); });

  if (window.jsconfuy.order) {
    assign(window.jsconfuy.order);
  } else if (window.jsconfuy.attendee) {
    fill(window.jsconfuy.attendee);
  } else if (window.jsconfuy.ticket || window.jsconfuy.discount || document.location.hash === '#asap' || document.location.hash === '#buy') {
    show(window.jsconfuy.ticket, window.jsconfuy.discount);
  }
})(window.jQuery, window.google);
