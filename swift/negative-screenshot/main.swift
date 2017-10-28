import Cocoa

struct Options: Decodable {
    let bounds: CGRect?
    let belowWindowWithId: CGWindowID?
    let uniqueWindowTitle: String?
}

let arguments = CommandLine.arguments.dropFirst()
let json = arguments.first!.data(using: .utf8)!
let options = try JSONDecoder().decode(Options.self, from: json)

// Get the windowId of the window we want to ignore. Default it to 0 which would not ignore any window
var optionalWindowId: CGWindowID? = options.belowWindowWithId

if optionalWindowId == nil, let uniqueWindowTitle = options.uniqueWindowTitle {
    if let windowInfoList = CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID) as? [[ String : Any ]] {
        // Get the window info for window with our target name
        if let windowInfo = windowInfoList.first(where: { $0["kCGWindowName"] as! String == uniqueWindowTitle }) {
            optionalWindowId = CGWindowID(windowInfo["kCGWindowNumber"] as! Int)
        }
    }
}

if let windowId = optionalWindowId {
    let cgImage = CGWindowListCreateImage(options.bounds!, .optionOnScreenBelowWindow, windowId, .bestResolution)

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
}

exit(1)
