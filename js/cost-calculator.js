document.addEventListener('DOMContentLoaded', function () {

  var floorNames = ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh'];

  var floorSelect = document.getElementById('floorSelect');
  var packageSelect = document.getElementById('packageSelect');
  var floorRowsBody = document.getElementById('floorRows');

  var sumpLiters = document.getElementById('sumpLiters');
  var septicLiters = document.getElementById('septicLiters');
  var wallLength = document.getElementById('wallLength');
  var wallHeight = document.getElementById('wallHeight');

  var sumpCostEl = document.getElementById('sumpCost');
  var septicCostEl = document.getElementById('septicCost');
  var wallCostEl = document.getElementById('wallCost');
  var grandTotalEl = document.getElementById('grandTotal');

  var SUMP_RATE = 30;
  var SEPTIC_RATE = 30;
  var WALL_RATE = 425;

  if (!floorSelect || !packageSelect || !floorRowsBody) return;

  function formatRs(amount) {
    var rounded = Math.round(amount);
    return 'Rs. ' + rounded.toLocaleString('en-IN');
  }

  function currentPackageRate() {
    return parseFloat(packageSelect.value) || 0;
  }

  /* ---------- Build the floor area rows for the selected number of floors ---------- */
  function renderFloorRows() {
    var floorCount = parseInt(floorSelect.value, 10) || 0; /* 0 = Ground only */
    var rate = currentPackageRate();
    floorRowsBody.innerHTML = '';

    for (var i = 0; i <= floorCount; i++) {
      var name = floorNames[i] || ('Floor ' + i);
      var row = document.createElement('tr');
      row.innerHTML =
        '<td>Enter required Built up Area for ' + name + ' Floor</td>' +
        '<td><input type="number" min="0" class="calc-input floor-area" data-floor="' + i + '" placeholder="Area in sqft"></td>' +
        '<td>sqft</td>' +
        '<td class="floor-rate">Rs.' + rate + '</td>' +
        '<td class="cost floor-cost" data-floor="' + i + '">Rs. 0</td>';
      floorRowsBody.appendChild(row);
    }

    attachFloorInputListeners();
    recalcTotal();
  }

  function attachFloorInputListeners() {
    var inputs = floorRowsBody.querySelectorAll('.floor-area');
    inputs.forEach(function (input) {
      input.addEventListener('input', recalcTotal);
    });
  }

  /* ---------- Update the displayed rate whenever the package changes ---------- */
  function updateFloorRates() {
    var rate = currentPackageRate();
    var rateCells = floorRowsBody.querySelectorAll('.floor-rate');
    rateCells.forEach(function (cell) { cell.textContent = 'Rs.' + rate; });
  }

  /* ---------- Recalculate every row + the grand total ---------- */
  function recalcTotal() {
    var rate = currentPackageRate();
    var total = 0;

    var floorInputs = floorRowsBody.querySelectorAll('.floor-area');
    floorInputs.forEach(function (input) {
      var area = parseFloat(input.value) || 0;
      var cost = area * rate;
      total += cost;
      var costCell = floorRowsBody.querySelector('.floor-cost[data-floor="' + input.getAttribute('data-floor') + '"]');
      if (costCell) costCell.textContent = formatRs(cost);
    });

    var sumpVal = parseFloat(sumpLiters.value) || 0;
    var sumpCost = sumpVal * SUMP_RATE;
    sumpCostEl.textContent = formatRs(sumpCost);
    total += sumpCost;

    var septicVal = parseFloat(septicLiters.value) || 0;
    var septicCost = septicVal * SEPTIC_RATE;
    septicCostEl.textContent = formatRs(septicCost);
    total += septicCost;

    var lengthVal = parseFloat(wallLength.value) || 0;
    var heightVal = parseFloat(wallHeight.value) || 0;
    var wallArea = lengthVal * heightVal;
    var wallCost = wallArea * WALL_RATE;
    wallCostEl.textContent = formatRs(wallCost);
    total += wallCost;

    grandTotalEl.textContent = formatRs(total);
  }

  floorSelect.addEventListener('change', renderFloorRows);
  packageSelect.addEventListener('change', function () {
    updateFloorRates();
    recalcTotal();
  });
  [sumpLiters, septicLiters, wallLength, wallHeight].forEach(function (el) {
    el.addEventListener('input', recalcTotal);
  });

  renderFloorRows();

  /* ======================================================================
     QUOTATION OVERLAY
     ====================================================================== */
  var getEstimateBtn = document.getElementById('getEstimateBtn');
  var closeQuoteBtn = document.getElementById('closeQuoteBtn');
  var printQuoteBtn = document.getElementById('printQuoteBtn');
  var downloadQuoteBtn = document.getElementById('downloadQuoteBtn');
  var quoteOverlay = document.getElementById('quoteOverlay');

  function buildQuote() {
    var rate = currentPackageRate();
    var packageLabel = packageSelect.options[packageSelect.selectedIndex].text;
    var floorCount = parseInt(floorSelect.value, 10) || 0;

    /* Estimate number + date */
    var now = new Date();
    var estNo = 'PEC-EST-' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') + '-' + String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0');
    var estDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    document.getElementById('quoteNo').textContent = 'Estimate No: ' + estNo;
    document.getElementById('quoteDate').textContent = 'Date: ' + estDate;
    document.getElementById('quoteName').textContent = document.getElementById('custName').value.trim() || '—';
    document.getElementById('quotePhone').textContent = document.getElementById('custPhone').value.trim() || '—';
    document.getElementById('quoteSite').textContent = document.getElementById('custSite').value.trim() || '—';
    document.getElementById('quotePackage').textContent = packageLabel;
    document.getElementById('quoteFloors').textContent = floorSelect.options[floorSelect.selectedIndex].text;

    var tbody = document.getElementById('quoteTableBody');
    tbody.innerHTML = '';
    var total = 0;

    for (var i = 0; i <= floorCount; i++) {
      var input = floorRowsBody.querySelector('.floor-area[data-floor="' + i + '"]');
      var area = input ? (parseFloat(input.value) || 0) : 0;
      var cost = area * rate;
      total += cost;
      var name = floorNames[i] || ('Floor ' + i);
      tbody.innerHTML += '<tr>' +
        '<td>' + name + ' Floor — Built-up Area</td>' +
        '<td>' + area.toLocaleString('en-IN') + ' sqft</td>' +
        '<td>sqft</td>' +
        '<td>' + rate.toLocaleString('en-IN') + '</td>' +
        '<td>' + Math.round(cost).toLocaleString('en-IN') + '</td>' +
        '</tr>';
    }

    var sumpVal = parseFloat(sumpLiters.value) || 0;
    var sumpCost = sumpVal * SUMP_RATE;
    total += sumpCost;
    tbody.innerHTML += '<tr>' +
      '<td>RCC Water Sump</td>' +
      '<td>' + sumpVal.toLocaleString('en-IN') + ' ltr</td>' +
      '<td>ltr</td>' +
      '<td>' + SUMP_RATE + '</td>' +
      '<td>' + Math.round(sumpCost).toLocaleString('en-IN') + '</td>' +
      '</tr>';

    var septicVal = parseFloat(septicLiters.value) || 0;
    var septicCost = septicVal * SEPTIC_RATE;
    total += septicCost;
    tbody.innerHTML += '<tr>' +
      '<td>Septic Tank</td>' +
      '<td>' + septicVal.toLocaleString('en-IN') + ' ltr</td>' +
      '<td>ltr</td>' +
      '<td>' + SEPTIC_RATE + '</td>' +
      '<td>' + Math.round(septicCost).toLocaleString('en-IN') + '</td>' +
      '</tr>';

    var lengthVal = parseFloat(wallLength.value) || 0;
    var heightVal = parseFloat(wallHeight.value) || 0;
    var wallArea = lengthVal * heightVal;
    var wallCost = wallArea * WALL_RATE;
    total += wallCost;
    tbody.innerHTML += '<tr>' +
      '<td>Plain Compound Wall (' + lengthVal + ' x ' + heightVal + ')</td>' +
      '<td>' + wallArea.toLocaleString('en-IN') + ' sqft</td>' +
      '<td>sqft</td>' +
      '<td>' + WALL_RATE + '</td>' +
      '<td>' + Math.round(wallCost).toLocaleString('en-IN') + '</td>' +
      '</tr>';

    document.getElementById('quoteTotal').textContent = formatRs(total);
  }

  if (getEstimateBtn) {
    getEstimateBtn.addEventListener('click', function () {
      buildQuote();
      quoteOverlay.classList.add('is-open');
      quoteOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeQuoteBtn) {
    closeQuoteBtn.addEventListener('click', function () {
      quoteOverlay.classList.remove('is-open');
      quoteOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  }

  if (printQuoteBtn) {
    printQuoteBtn.addEventListener('click', function () {
      window.print();
    });
  }

  /* ---------- Download the quotation as a PDF (html2canvas + jsPDF) ---------- */
  if (downloadQuoteBtn) {
    downloadQuoteBtn.addEventListener('click', function () {
      var target = document.getElementById('quotePage');
      if (!window.html2canvas || !window.jspdf) {
        window.print();
        return;
      }

      downloadQuoteBtn.disabled = true;
      var originalLabel = downloadQuoteBtn.textContent;
      downloadQuoteBtn.textContent = 'Preparing PDF…';

      window.html2canvas(target, { scale: 2, useCORS: true }).then(function (canvas) {
        var imgData = canvas.toDataURL('image/jpeg', 0.95);
        var jsPDF = window.jspdf.jsPDF;
        var pdf = new jsPDF('p', 'mm', 'a4');
        var pageWidth = pdf.internal.pageSize.getWidth();
        var pageHeight = pdf.internal.pageSize.getHeight();
        var imgWidth = pageWidth;
        var imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (imgHeight <= pageHeight) {
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        } else {
          /* Split tall content across multiple A4 pages */
          var heightLeft = imgHeight;
          var position = 0;
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
        }

        var fileName = 'Pentagan-Construction-Estimate-' + Date.now() + '.pdf';
        pdf.save(fileName);

        downloadQuoteBtn.disabled = false;
        downloadQuoteBtn.textContent = originalLabel;
      }).catch(function () {
        downloadQuoteBtn.disabled = false;
        downloadQuoteBtn.textContent = originalLabel;
        window.print();
      });
    });
  }

});