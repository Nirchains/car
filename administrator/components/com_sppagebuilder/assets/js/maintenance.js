/**
 * @package SP Page Builder
 * @author JoomShaper http://www.joomshaper.com
 * @copyright Copyright (c) 2010 - 2020 JoomShaper
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
 */

window.addEventListener("DOMContentLoaded", (e) => {
  const config = Joomla.getOptions("config");

  const parent = ".view-maintenance";
  const $fixBtn = document.querySelector(`${parent} .action-fix-sppagebuilder-database`);

  if (config.btnStatus === "disabled") {
    $fixBtn.setAttribute("disabled", true);
  } else {
    $fixBtn.removeAttribute("disabled");
  }

  const $wrapper = document.querySelector(`${parent} .maintenance-window-wrapper`);

  let timeout = null;

  $fixBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    $wrapper.innerHTML =
      '<span class="fas fa-spinner fa-spin"></span> &nbsp;<strong>' +
      Joomla.JText._("COM_SPPAGEBUILDER_MAINTENANCE_PROGRESS") +
      "<strong>";

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(async () => {
      const url = `${config.base}?option=${config.component}&view=maintenance&task=maintenance.fix`;

      const resp = await fetch(url);
      const data = await resp.json();

      if (data) {
        if (data.data.errors.length > 0) {
          $wrapper.innerHTML =
            '<div class="alert alert-danger">' +
            "<h4>" +
            Joomla.JText._("COM_SPPAGEBUILDER_MAINTENANCE_UNABLE_TO_FIX") +
            "</h4>" +
            Joomla.JText._("COM_SPPAGEBUILDER_MAINTENANCE_ISSUE_MESSAGE") +
            "</div>";
        } else {
          $wrapper.innerHTML = "";
        }

        if (data.data.html.length > 0) {
          $wrapper.innerHTML += data.data.html;
        } else {
          $wrapper.innerHTML =
            '<div class="alert alert-info">' + Joomla.JText._("COM_SPPAGEBUILDER_MAINTENANCE_IS_UPTODATE") + "</div>";
        }

        if (data.data.errors.length === 0) {
          $fixBtn.setAttribute("disabled", true);
        } else {
          $fixBtn.removeAttribute("disabled");
        }
      } else {
        $wrapper.innerHTML =
          '<div class="alert alert-info">' + Joomla.JText._("COM_SPPAGEBUILDER_MAINTENANCE_IS_UPTODATE") + "</div>";
      }
    }, 1000);
  });
});
