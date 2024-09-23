// index.js
//import "./styles.css";

(function () {
  const hostName = "demo-ds.ccc.digiserve.id";
  const integrationToken = "055432322c60baf90f8f6e9a";

  let ctiUrl = `https://${hostName}/cti`;
  let href = null;

  // Query for DOM elements
  const wrapper = document.querySelector(".grid");
  const actionsWrapper = wrapper.querySelector("#actions-wrapper");
  const frameWrapper = wrapper.querySelector("#frame-wrapper");
  const logWrapper = wrapper.querySelector("#log-wrapper");
  const iFrameElement = frameWrapper.querySelector("#ipscape-cti-frame");
  const logItemsList = logWrapper.querySelector("#log-list-items");
  const isAuthorisedBtn = actionsWrapper.querySelector("#btn-isAuthorised");
  const agentDetailsBtn = actionsWrapper.querySelector("#btn-getAgentDetails");

  const agentCampaignsBtn = actionsWrapper.querySelector(
    "#btn-getAgentCampaigns"
  );

  const agentPresenceBtn = actionsWrapper.querySelector(
    "#btn-getAgentPresence"
  );

  const pauseReasonsBtn = actionsWrapper.querySelector("#btn-getPauseReasons");

  const getCurrentInteractionBtn = actionsWrapper.querySelector(
    "#btn-getCurrentInteraction"
  );

  const getIntegrationSettingsBtn = actionsWrapper.querySelector(
    "#btn-getIntegrationSettings"
  );

  const inCallComponentOptionAddBtn = actionsWrapper.querySelector(
    "#btn-inCallComponentOptionAdd"
  );

  const clearLogLink = logWrapper.querySelector("#clearLogLink");

  frameWrapper.setAttribute("data-origin", window.location.origin);

  function setTimeStamp() {
    const ts = new Date();
    return `${ts.toLocaleDateString("en-AU")} - ${ts.toLocaleTimeString(
      "en-AU"
    )}`;
  }

  /*
   * Creates a log entry and prepends it to the list
   */
  function addLogEntry(data) {
    // Create list item and append timestamp node
    const listItem = document.createElement("LI");
    const timeSpan = document.createElement("DIV");
    timeSpan.className = "timestamp";
    timeSpan.innerText = setTimeStamp().toString();
    listItem.className = "log-list-item";
    listItem.appendChild(timeSpan);
    // Create data text node and append to list item
    const { methodName, response } = data;

    // Add listener to enable/disable click-to-dial
    if (methodName === "agentLogin") enableClickToDial();
    if (methodName === "agentLogout") disableClickToDial();

    const dataEl = document.createTextNode(
      `${methodName}: ${JSON.stringify(response)}`
    );
    listItem.appendChild(dataEl);
    // Append list item to unordered list
    logItemsList.prepend(listItem);
  }

  function postIntegrationCommand(message) {
    iFrameElement.contentWindow.postMessage(message, "*");
  }

  function enableClickToDial() {
    const clickToDialLink = actionsWrapper.querySelector("#clickToDialLink");
    if (clickToDialLink.matches("a")) return;
    // create icon
    const icon = document.createElement("i");
    icon.className = "fa fa-phone";
    // replace <p> with <a>
    const a = document.createElement("a");
    a.id = "clickToDialLink";
    a.href = "#";
    a.className = "click-to-dial active";
    a.textContent = " +61 2 8999 3333";
    a.prepend(icon);
    a.addEventListener("click", handleClickToDial);

    clickToDialLink.replaceWith(a);
  }

  function disableClickToDial() {
    const clickToDialLink = actionsWrapper.querySelector("#clickToDialLink");
    if (clickToDialLink.matches("p")) return;

    // create icon
    const icon = document.createElement("i");
    icon.className = "fa fa-minus-circle";

    // replace <p> with <a>
    const p = document.createElement("p");
    p.id = "clickToDialLink";
    p.className = "click-to-dial disabled";
    p.textContent = " +61 2 8999 3333";
    p.prepend(icon);

    clickToDialLink.replaceWith(p);
  }

  function handleClickToDial(event) {
    event.preventDefault();
    if (event.target.className === "disabled") {
      addLogEntry({
        methodName: "click-to-dial",
        response: { error: "Click to dial disabled" },
      });
      return;
    }
    const phone = event.target.innerText;
    postIntegrationCommand({ event: "clickToDial", number: phone });
  }

  function handleActionButtonClick(e) {
    e.preventDefault();
    const { dataset } = e.target;
    const payload = { event: dataset.label, payload: dataset.payload };
    postIntegrationCommand(payload);
  }

  function setActionEventListeners() {
    // Set event handlers
    clearLogLink.addEventListener("click", (e) => {
      e.preventDefault();
      logItemsList.innerHTML = "";
    });
    // Set button handlers
    isAuthorisedBtn.addEventListener("click", handleActionButtonClick);
    agentDetailsBtn.addEventListener("click", handleActionButtonClick);
    agentPresenceBtn.addEventListener("click", handleActionButtonClick);
    agentCampaignsBtn.addEventListener("click", handleActionButtonClick);
    pauseReasonsBtn.addEventListener("click", handleActionButtonClick);
    getCurrentInteractionBtn.addEventListener("click", handleActionButtonClick);
    getIntegrationSettingsBtn.addEventListener(
      "click",
      handleActionButtonClick
    );
    inCallComponentOptionAddBtn.addEventListener(
      "click",
      handleActionButtonClick
    );
  }

  function initialize() {
    // Set the listener for postMessage
    window.addEventListener(
      "message",
      (event) => {
        addLogEntry(event.data);
      },
      false
    );

    // Assign frame src
    if (href)
      iFrameElement.src = `${href}/${
        integrationToken ? "?integration=" + integrationToken : ""
      }`;
    else
      iFrameElement.src = `${ctiUrl}/${
        integrationToken ? "?integration=" + integrationToken : ""
      }`;
    iFrameElement.onload = () => {
      setActionEventListeners();
    };
  }

  initialize();
})();
