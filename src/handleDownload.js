const handleDownload = (data) => {
    const jsonData = JSON.stringify(data, null, 2); // Pretty-print the JSON
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json'; // You can name the file as you like
    a.click();

    URL.revokeObjectURL(url); // Free up memory
};

export default handleDownload;