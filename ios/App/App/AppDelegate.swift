import UIKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }
}

// Екранът на играта: вертикално, часовникът горе се вижда (светли букви върху зелената лента на играта).
class GameViewController: CAPBridgeViewController {

    override func capacitorDidLoad() {
        guard let webView = webView else { return }
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.allowsLinkPreview = false
        let green = UIColor(red: 0x11 / 255.0, green: 0x3A / 255.0, blue: 0x28 / 255.0, alpha: 1)
        webView.isOpaque = true
        webView.backgroundColor = green
        webView.scrollView.backgroundColor = green
        if #available(iOS 16.4, *) { webView.isInspectable = true } // Safari → Develop → iPhone (за проверки)
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        setNeedsStatusBarAppearanceUpdate()
    }

    override var prefersStatusBarHidden: Bool { false }
    override var preferredStatusBarStyle: UIStatusBarStyle { .lightContent }
    override var supportedInterfaceOrientations: UIInterfaceOrientationMask { .portrait }
}
