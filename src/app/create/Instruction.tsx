const Instruction = () => {
    return <div className="bg-white rounded shadow p-4 fixed right-4 top-1/4 z-50">
        <h2 className="text-lg font-medium mb-2">Instructions</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Drag elements from the sidebar into the editor area</li>
            <li>Click on elements to edit their content</li>
            <li>Use the toolbar to format your text</li>
            <li>Switch to Preview mode to see how your post will look</li>
            <li>Click Save Post when you're finished</li>
        </ul>
    </div>
}

export default Instruction;