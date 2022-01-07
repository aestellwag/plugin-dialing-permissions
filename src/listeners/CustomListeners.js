import { Actions, Notifications, NotificationType } from "@twilio/flex-ui";

// Registering the notification
function registerNotification () {

    const dialing = "Dialing Permissions";
    Notifications.registerNotification({
    id: dialing,
    closeButton: true,
    content: `The number you have dialed is restricted.  Dialing restricted to US, Mexico, and Canada numbers only.`,
    type: NotificationType.warning,
    timeout: 8000,
    });
    // Fire off the Notification we just registered
    Notifications.showNotification(dialing);
    // Delete the alert, the alert will still show in the UI but this gives the ability
    // if the agent happens to try again, this will allow for a new alert
    Notifications.registeredNotifications.delete(dialing);
    
    return;
}

// Adding a listener
Actions.addListener('beforeStartOutboundCall', (payload, abortFunction) => {
    console.log(`beforeStartOutboundCall Listener Triggered`);

    // Setup restriction logic below for any numbers/area codes/country codes to restrict
    
    // Emergency Dialing Excemption
    const emergencyNumbers = ["911", "060", "065"];
    if (emergencyNumbers.some(n => payload.destination.match(n))) {
        console.log(`Emergency Number Dialed!`);
    } else {
        // List of allowed country codes +1 & 001 = US & Canada, +52 & 0052 = Mexico
        // This list could be shifted to blocked countries, but that list would likely be a lot longer :)
        const allowedCountryCodes = ["+1", "001", "+52", "0052"];
        if (allowedCountryCodes.some(n => payload.destination.includes(n))) {
            console.log(`Allowed Number Dailed!"`);
        } else {
            console.log('Restricted Dialing Triggered!');
            // Canceling the call
            abortFunction();
            // Registering the notification
            registerNotification();
        }
    }
});