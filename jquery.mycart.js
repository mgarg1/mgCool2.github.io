/*
 * jQuery myCart - v1.7 - 2018-03-07
 * http://asraf-uddin-ahmed.github.io/
 * Copyright (c) 2017 Asraf Uddin Ahmed; Licensed None
 */

(function ($) {
  "use strict";

  var OptionManager = (function () {
    var objToReturn = {};

    var _options = null;
    var DEFAULT_OPTIONS = {
      currencySymbol: "Rs.",
      classCartIcon: "my-cart-icon",
      classCartBadge: "my-cart-badge",
      classProductQuantity: "my-product-quantity",
      classProductRemove: "my-product-remove",
      classCheckoutCart: "my-cart-checkout",
      affixCartIcon: true,
      showCheckoutModal: true,
      numberOfDecimals: 2,
      cartItems: null,
      clickOnAddToCart: function ($addTocart) {},
      afterAddOnCart: function (products, totalPrice, totalQuantity) {},
      clickOnCartIcon: function (
        $cartIcon,
        products,
        totalPrice,
        totalQuantity
      ) {},
      checkoutCart: function (products, totalPrice, totalQuantity) {
        return false;
      },
      getDiscountPrice: function (products, totalPrice, totalQuantity) {
        return null;
      },
    };

    var loadOptions = function (customOptions) {
      _options = $.extend({}, DEFAULT_OPTIONS);
      if (typeof customOptions === "object") {
        $.extend(_options, customOptions);
      }
    };
    var getOptions = function () {
      return _options;
    };

    objToReturn.loadOptions = loadOptions;
    objToReturn.getOptions = getOptions;
    return objToReturn;
  })();

  var MathHelper = (function () {
    var objToReturn = {};
    var getRoundedNumber = function (number) {
      if (isNaN(number)) {
        throw new Error("Parameter is not a Number");
      }
      number = number * 1;
      var options = OptionManager.getOptions();
      return number.toFixed(options.numberOfDecimals);
    };
    objToReturn.getRoundedNumber = getRoundedNumber;
    return objToReturn;
  })();

  var ProductManager = (function () {
    var objToReturn = {};

    /*
    PRIVATE
    */
    localStorage.products = localStorage.products ? localStorage.products : "";
    var getIndexOfProduct = function (id) {
      var productIndex = -1;
      var products = getAllProducts();
      $.each(products, function (index, value) {
        if (value.id == id) {
          productIndex = index;
          return;
        }
      });
      return productIndex;
    };
    var setAllProducts = function (products) {
      localStorage.products = JSON.stringify(products);
    };
    var addProduct = function (id, name, summary, price, quantity, image) {
      var products = getAllProducts();
      products.push({
        id: id,
        name: name,
        summary: summary,
        price: price,
        quantity: quantity,
        image: image,
      });
      setAllProducts(products);
    };

    /*
    PUBLIC
    */
    var getAllProducts = function () {
      try {
        var products = JSON.parse(localStorage.products);
        return products;
      } catch (e) {
        return [];
      }
    };
    var updatePoduct = function (id, quantity) {
      var productIndex = getIndexOfProduct(id);
      if (productIndex < 0) {
        return false;
      }
      var products = getAllProducts();
      products[productIndex].quantity =
        typeof quantity === "undefined"
          ? products[productIndex].quantity * 1 + 1
          : quantity;
      setAllProducts(products);
      return true;
    };
    var setProduct = function (id, name, summary, price, quantity, image) {
      if (typeof id === "undefined") {
        console.error("id required");
        return false;
      }
      if (typeof name === "undefined") {
        console.error("name required");
        return false;
      }
      if (typeof image === "undefined") {
        console.error("image required");
        return false;
      }
      if (!$.isNumeric(price)) {
        console.error("price is not a number");
        return false;
      }
      if (!$.isNumeric(quantity)) {
        console.error("quantity is not a number");
        return false;
      }
      summary = typeof summary === "undefined" ? "" : summary;

      if (!updatePoduct(id)) {
        addProduct(id, name, summary, price, quantity, image);
      }
    };
    var clearProduct = function () {
      setAllProducts([]);
    };
    var removeProduct = function (id) {
      var products = getAllProducts();
      products = $.grep(products, function (value, index) {
        return value.id != id;
      });
      setAllProducts(products);
    };
    var getTotalQuantity = function () {
      var total = 0;
      var products = getAllProducts();
      $.each(products, function (index, value) {
        total += value.quantity * 1;
      });
      return total;
    };
    var getTotalPrice = function () {
      var products = getAllProducts();
      var total = 0;
      $.each(products, function (index, value) {
        total += value.quantity * value.price;
        total = MathHelper.getRoundedNumber(total) * 1;
      });
      return total;
    };

    objToReturn.getAllProducts = getAllProducts;
    objToReturn.updatePoduct = updatePoduct;
    objToReturn.setProduct = setProduct;
    objToReturn.clearProduct = clearProduct;
    objToReturn.removeProduct = removeProduct;
    objToReturn.getTotalQuantity = getTotalQuantity;
    objToReturn.getTotalPrice = getTotalPrice;
    return objToReturn;
  })();

  var loadMyCartEvent = function (targetSelector) {
    var options = OptionManager.getOptions();
    var $cartIcon = $("." + options.classCartIcon);
    var $cartBadge = $("." + options.classCartBadge);
    var classProductQuantity = options.classProductQuantity;
    var classProductRemove = options.classProductRemove;
    var classCheckoutCart = options.classCheckoutCart;

    var idCartModal = "my-cart-modal";
    var idCartTable = "my-cart-table";
    var idGrandTotal = "my-cart-grand-total";
    var idEmptyCartMessage = "my-cart-empty-message";
    var idDiscountPrice = "my-cart-discount-price";
    var classProductTotal = "my-product-total";
    var classAffixMyCartIcon = "my-cart-icon-affix";

    if (options.cartItems && options.cartItems.constructor === Array) {
      ProductManager.clearProduct();
      $.each(options.cartItems, function () {
        ProductManager.setProduct(
          this.id,
          this.name,
          this.summary,
          this.price,
          this.quantity,
          this.image
        );
      });
    }

    $cartBadge.text(ProductManager.getTotalQuantity());

    if (!$("#" + idCartModal).length) {
      $("body").append(
        '<div class="modal fade" id="' +
          idCartModal +
          '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">' +
          '<div class="modal-dialog" role="document">' +
          '<div class="modal-content">' +
          '<div class="modal-header">' +
          '<h4 class="modal-title" id="myModalLabel">' +
          "My Cart <span>" +
          "</span></h4>" +
          '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
          "</div>" +
          '<div class="modal-body">' +
          '<table class="table table-hover table-borderless outer-table" id="' +
          idCartTable +
          '"></table>' +
          "</div>" +
          '<div class="modal-footer">' +
          '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
          '<button type="button" class="btn btn-primary ' +
          classCheckoutCart +
          '">Checkout</button>' +
          "</div>" +
          "</div>" +
          "</div>" +
          "</div>"
      );
    }

    var drawTable = function () {
      var $cartTable = $("#" + idCartTable);
      $cartTable.empty();

      var products = ProductManager.getAllProducts();
      $.each(products, function () {
        var total = this.quantity * this.price;
        $cartTable.append(
          '<tr class="row" title="' +
            this.summary +
            '" data-id="' +
            this.id +
            '" data-price="' +
            this.price +
            '">' +
            '<td class="text-center"><img width="30px" height="30px" src="' +
            this.image +
            '">' +
            "</td>" +
            "<td>" +
            this.name +
            "</td>" +
            "</tr>" +
            '<tr title="' +
            this.summary +
            '" data-id="' +
            this.id +
            '" data-price="' +
            this.price +
            '">' +
            '<td class="text-left" title="Unit Price">' +
            options.currencySymbol +
            MathHelper.getRoundedNumber(this.price) +
            "</td>" +
            '<td title="Quantity"><input type="number" min="1" style="max-width: 70px;" class="' +
            classProductQuantity +
            '" value="' +
            this.quantity +
            '"></td>' +
            "</tr>" +
            '<tr style="border-bottom: 1px solid #bbb;" title="' +
            this.summary +
            '" data-id="' +
            this.id +
            '" data-price="' +
            this.price +
            '">' +
            '<td title="Total" class="col-lg-2 col-md-2 col-sm-6 text-left ' +
            classProductTotal +
            '">' +
            options.currencySymbol +
            MathHelper.getRoundedNumber(total) +
            "</div>" +
            '<td title="Remove from Cart" class="col-lg-2 col-md-2 col-sm-6"><a href="javascript:void(0);" class="btn btn-sm btn-outline-danger ' +
            classProductRemove +
            '">Remove</a></td>' +
            '</tr><hr style="border: 4px; max-width: 250px;">'
        );
      });

      $cartTable.append(
        products.length
          ? '<br><table class="cart-footer"><tr>' +
              '<td class="text-left"><strong>Total</strong></td>' +
              '<td class="text-right"><strong id="' +
              idGrandTotal +
              '"></strong></td>' +
              "</tr></table>"
          : '<div class="alert alert-danger" role="alert" id="' +
              idEmptyCartMessage +
              '">Your cart is empty</div>'
      );

      var discountPrice = options.getDiscountPrice(
        products,
        ProductManager.getTotalPrice(),
        ProductManager.getTotalQuantity()
      );
      if (products.length && discountPrice !== null) {
        $cartTable
          .append
          // '<tr style="color: red">' +
          // '<td></td>' +
          // '<td><strong>Total (including discount)</strong></td>' +
          // '<td></td>' +
          // '<td></td>' +
          // '<td class="text-right"><strong id="' + idDiscountPrice + '"></strong></td>' +
          // '<td></td>' +
          // '</tr>'
          ();
      }

      showGrandTotal();
      showDiscountPrice();
    };
    var showModal = function () {
      drawTable();
      $("#" + idCartModal).modal("show");
    };
    var updateCart = function () {
      $.each($("." + classProductQuantity), function () {
        var id = $(this).closest("tr").data("id");
        ProductManager.updatePoduct(id, $(this).val());
      });
    };
    var showGrandTotal = function () {
      $("#" + idGrandTotal).text(
        options.currencySymbol +
          MathHelper.getRoundedNumber(ProductManager.getTotalPrice())
      );
    };
    var showDiscountPrice = function () {
      $("#" + idDiscountPrice).text(
        options.currencySymbol +
          MathHelper.getRoundedNumber(
            options.getDiscountPrice(
              ProductManager.getAllProducts(),
              ProductManager.getTotalPrice(),
              ProductManager.getTotalQuantity()
            )
          )
      );
    };

    /*
    EVENT
    */
    if (options.affixCartIcon) {
      var cartIconBottom =
        $cartIcon.offset().top * 1 + $cartIcon.css("height").match(/\d+/) * 1;
      var cartIconPosition = $cartIcon.css("position");
      $(window).scroll(function () {
        $(window).scrollTop() >= cartIconBottom
          ? $cartIcon.addClass(classAffixMyCartIcon)
          : $cartIcon.removeClass(classAffixMyCartIcon);
      });
    }

    $cartIcon.click(function () {
      options.showCheckoutModal
        ? showModal()
        : options.clickOnCartIcon(
            $cartIcon,
            ProductManager.getAllProducts(),
            ProductManager.getTotalPrice(),
            ProductManager.getTotalQuantity()
          );
    });

    $(document).on("input", "." + classProductQuantity, function () {
      var price = $(this).closest("tr").data("price");
      var id = $(this).closest("tr").data("id");
      var quantity = $(this).val();

      $(this)
        .parent("td")
        .next("." + classProductTotal)
        .text(
          options.currencySymbol + MathHelper.getRoundedNumber(price * quantity)
        );
      ProductManager.updatePoduct(id, quantity);

      $cartBadge.text(ProductManager.getTotalQuantity());
      showGrandTotal();
      showDiscountPrice();
    });

    $(document).on("keypress", "." + classProductQuantity, function (evt) {
      if (evt.keyCode == 38 || evt.keyCode == 40) {
        return;
      }
      evt.preventDefault();
    });

    $(document).on("click", "." + classProductRemove, function () {
      var $tr = $(this).closest("tr");
      var id = $tr.data("id");
      $tr.hide(500, function () {
        ProductManager.removeProduct(id);
        drawTable();
        $cartBadge.text(ProductManager.getTotalQuantity());
      });
    });

    $(document).on("click", "." + classCheckoutCart, function () {
      var products = ProductManager.getAllProducts();
      if (!products.length) {
        $("#" + idEmptyCartMessage)
          .fadeTo("fast", 0.5)
          .fadeTo("fast", 1.0);
        return;
      }
      updateCart();
      var isCheckedOut = options.checkoutCart(
        ProductManager.getAllProducts(),
        ProductManager.getTotalPrice(),
        ProductManager.getTotalQuantity()
      );
      if (isCheckedOut !== false) {
        ProductManager.clearProduct();
        $cartBadge.text(ProductManager.getTotalQuantity());
        $("#" + idCartModal).modal("hide");
      }
    });

    $(document).on("click", targetSelector, function () {
      var $target = $(this);
      options.clickOnAddToCart($target);

      var id = $target.data("id");
      var name = $target.data("name");
      var summary = $target.data("summary");
      var price = $target.data("price");
      var quantity = $target.data("quantity");
      var image = $target.data("image");

      ProductManager.setProduct(id, name, summary, price, quantity, image);
      $cartBadge.text(ProductManager.getTotalQuantity());

      options.afterAddOnCart(
        ProductManager.getAllProducts(),
        ProductManager.getTotalPrice(),
        ProductManager.getTotalQuantity()
      );
    });
  };

  $.fn.myCart = function (userOptions) {
    OptionManager.loadOptions(userOptions);
    loadMyCartEvent(this.selector);
    return this;
  };
})(jQuery);
