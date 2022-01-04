import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';
import { Actions, Notifications, NotificationType } from "@twilio/flex-ui";
import reducers, { namespace } from './states';

const PLUGIN_NAME = 'DialingPermissionsPlugin';

export default class DialingPermissionsPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {
    this.registerReducers(manager);

    // Adding a listener
    Actions.addListener('beforeStartOutboundCall', (payload, abortFunction) => {
      console.log(`beforeStartOutboundCall Listener Triggered`);
      console.log(payload);
      console.log(payload.destination);

      // Setup restriction logic below for any numbers/area codes/country codes to restrict
      if(payload.destination === "+17657309081"){
        console.log('Restricted Dialing Triggered!');
        // Canceling the call
        abortFunction();

        // Registering the notification
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
      }
    });
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint-disable-next-line
      console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
