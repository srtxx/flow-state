import { useEffect } from 'react';

interface BuyMeACoffeeWidgetProps {
    username: string;
}

/**
 * Buy Me a Coffee floating widget component
 * Loads the official BMC widget script
 */
export function BuyMeACoffeeWidget({ username }: BuyMeACoffeeWidgetProps) {
    useEffect(() => {
        // Check if script already exists
        if (document.getElementById('bmc-widget-script')) {
            return;
        }

        // Create script element
        const script = document.createElement('script');
        script.id = 'bmc-widget-script';
        script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js';
        script.async = true;

        // Set data attributes
        script.dataset.name = 'BMC-Widget';
        script.dataset.cfasync = 'false';
        script.dataset.id = username;
        script.dataset.description = 'Support me on Buy me a coffee!';
        script.dataset.message = 'このアプリが役に立ったら、コーヒー1杯分のサポートをお願いします ☕';
        script.dataset.color = '#171717';
        script.dataset.position = 'Right';
        script.dataset.x_margin = '18';
        script.dataset.y_margin = '110'; // Above bottom nav (increased for mobile)

        script.onload = () => {
            console.log('Buy Me a Coffee widget loaded');
        };

        script.onerror = (error) => {
            console.error('Failed to load Buy Me a Coffee widget:', error);
        };

        document.body.appendChild(script);

        return () => {
            // Cleanup on unmount
            const scriptToRemove = document.getElementById('bmc-widget-script');
            if (scriptToRemove) {
                scriptToRemove.remove();
            }
            // Remove the widget element too
            const widget = document.getElementById('bmc-wbtn');
            if (widget) {
                widget.remove();
            }
        };
    }, [username]);

    return null; // This component doesn't render anything, just loads the script
}

export default BuyMeACoffeeWidget;

