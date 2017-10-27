import Cocoa

let args = CommandLine.arguments
let x = Int(args[1]) ?? 0
let y = Int(args[2]) ?? 0
let width = Int(args[3]) ?? 100
let height = Int(args[4]) ?? 100
let windowId = Int(args[5])
    
let rect = NSMakeRect(CGFloat(x), CGFloat(y), CGFloat(width), CGFloat(height))
let cgImage = CGWindowListCreateImage(rect, .optionOnScreenBelowWindow, CGWindowID(windowId ?? 0), .bestResolution)

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
