// Input: ISO date string
const inputDate = "2025-05-28T15:45:33.809Z";

// Convert to Date object
const date = new Date(inputDate);

// Method 1: Simple readable format
const simpleFormat = date.toLocaleString();
// console.log("Simple format:", simpleFormat);

// Method 2: Custom formatted string
const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
};
const customFormat = date.toLocaleString('en-US', options);
// console.log("Custom format:", customFormat);

// Method 3: Manual formatting function
function formatDate(dateObj : any) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const month = months[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();

    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12

    return `${month} ${day}, ${year} at ${hours}:${minutes} ${ampm}`;
}

const manualFormat = formatDate(date);
console.log("Manual format:", manualFormat);

// Method 5: Function to convert any ISO date
function convertDate(isoString: string) {
    const d = new Date(isoString);

    if (isNaN(d.getTime())) {
        return "";
    }

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    return d.toLocaleString('en-US', options);
}

function calculateGapTime(isoString: string) {
    const d = new Date(isoString);
    const now = new Date();

    if (isNaN(d.getTime())) {
        return "";
    }

    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute(s) ago`;
    if (diffHours < 24) return `${diffHours} hour(s) ago`;
    return `${diffDays} day(s) ago`;
}

export { calculateGapTime };

export default convertDate;

