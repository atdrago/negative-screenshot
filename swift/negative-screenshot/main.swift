import Cocoa

let args = CommandLine.arguments
let x = Int(args[1]) ?? 0
let y = Int(args[2]) ?? 0
let width = Int(args[3]) ?? 100
let height = Int(args[4]) ?? 100
let windowTargetTitle = "Negative - Capture"

// Get the windowId of the window we want to ignore. Default it to 0 which would not ignore any window
var windowId = 0

if let windowInfoList = CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID) as? [[ String : Any ]] {
    // Get the window info for window with our target name
    if let windowInfo = windowInfoList.first(where: { $0["kCGWindowName"] as! String == windowTargetTitle }) {
        windowId = (windowInfo["kCGWindowNumber"] as! Int)
    }
}

let rect = NSMakeRect(CGFloat(x), CGFloat(y), CGFloat(width), CGFloat(height))
let cgImage = CGWindowListCreateImage(rect, .optionOnScreenBelowWindow, CGWindowID(windowId), .bestResolution)

if let image = cgImage {
    let imageRep = NSBitmapImageRep(cgImage: image)
    let pngData = imageRep.representation(using: .png, properties: [:])
    let base64 = pngData?.base64EncodedString()

    if let base64String = base64 {
        let uri = "data:image/png;base64," + base64String
        print(uri)
        exit(0)
    }
}

exit(1)
