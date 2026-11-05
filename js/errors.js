// Loaded first so startup crashes anywhere else are reported instead of silently
// leaving the page without working buttons.
(function () {
    const recent = [];
    let toast = null;
    let hideTimer = null;

    window.roninErrors = recent;

    function ensureToast() {

        if (toast) {
            return toast;
        }

        toast = document.createElement("div");
        toast.id = "errorToast";
        toast.setAttribute("role", "alert");
        toast.hidden = true;
        toast.addEventListener("click", () => {
            toast.hidden = true;
        });
        document.body.appendChild(toast);
        return toast;
    }

    function report(message) {

        if (!message || recent.includes(message)) {
            return;
        }

        recent.push(message);

        if (!document.body) {
            return;
        }

        const element = ensureToast();
        element.textContent = `Something went wrong: ${message} (tap to dismiss)`;
        element.hidden = false;
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            element.hidden = true;
        }, 12000);
    }

    window.addEventListener("error", (event) => {
        report(event.message || (event.error && event.error.message) || "Unknown error");
    });

    window.addEventListener("unhandledrejection", (event) => {
        const reason = event.reason;
        report(reason && reason.message ? reason.message : String(reason));
    });
}());
