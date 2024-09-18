package xyz.josapedmoreno.hwvci

import com.intellisrc.core.Config
import com.intellisrc.core.Log
import com.intellisrc.core.SysInfo
import com.intellisrc.core.SysService
import com.intellisrc.db.Database
import com.intellisrc.thread.Tasks
import com.intellisrc.web.WebService
import xyz.josapedmoreno.hwvci.control.Paths.Companion.publicResources
import xyz.josapedmoreno.hwvci.services.AuthService
import xyz.josapedmoreno.hwvci.services.ControlServices
import xyz.josapedmoreno.hwvci.services.SSEEventService
import xyz.josapedmoreno.hwvci.services.SSENotifier
import xyz.josapedmoreno.hwvci.table.Users

class App : SysService() {
    override fun onStart() {
        val sseNotifier = SSENotifier(sseEventService)
        SSENotifier.setInstance(sseNotifier)

        var port = Config.getInt("web.port")
        if (!args.isEmpty())
            port = Integer.parseInt(args.poll())
        webService.port = port
        webService.setResources(SysInfo.getFile(publicResources))
        webService.add(sseEventService)
        webService.add(AuthService())
        webService.add(ControlServices())
        webService.start(true)

        if (Users().createAdmin()) {
            Log.i("Admin is created")
        }
    }

    override fun onStop() {
        super.onStop()
        webService.stop()
        Database.getDefault().quit()
    }

    companion object {
        private val webService = WebService()
        init {
            service = App()
        }
        private val sseEventService = SSEEventService()
    }
}