package xyz.josapedmoreno.hwvci.control

import com.google.gson.JsonArray
import com.intellisrc.core.Log
import org.crosswire.jsword.book.Book
import org.crosswire.jsword.book.BookCategory
import org.crosswire.jsword.book.BookData
import org.crosswire.jsword.book.BookException
import org.crosswire.jsword.book.Books
import org.crosswire.jsword.book.OSISUtil
import org.crosswire.jsword.book.install.InstallException
import org.crosswire.jsword.book.install.InstallManager
import org.crosswire.jsword.book.install.Installer
import org.crosswire.jsword.book.sword.SwordBookMetaData
import org.crosswire.jsword.book.sword.SwordBookPath
import org.crosswire.jsword.passage.Key
import java.io.File

class BookApi {
    companion object {
        fun listAvailableBibles(): MutableMap<String, Any> {
            val map = mutableMapOf<String, Any>()
            try {
                // Create an InstallManager to manage repositories
                val installManager = InstallManager()

                // Get the default CrossWire repository installer
                val installer: Installer = installManager.getInstaller("CrossWire")

                // Get all available modules (books) from the repository
                val availableBooks: List<Book> = installer.books

                // Filter books that are valid and are in the Bible category
                val bibles = availableBooks.filter { book ->
                    try {
                        // Only include valid books with correct metadata and in the Bible category
                        book.bookMetaData is SwordBookMetaData &&
                                book.bookCategory == BookCategory.BIBLE
                    } catch (e: Exception) {
                        // Log the error for malformed books and skip them
                        Log.w("Skipping unsupported book: ${book.initials}, error: ${e.message}")
                        false
                    }
                }

                // Display available Bible versions
                Log.i("Available Bible Versions:")
                bibles.forEach { book ->
                    val metaData = book.bookMetaData as SwordBookMetaData
                    Log.d("${metaData.initials} - ${metaData.name}")
                    map[metaData.initials] = metaData.name
                }
            } catch (e: Exception) {
                Log.w("Error retrieving books.", e.printStackTrace())
            }
            return map.toSortedMap()
        }
        fun installDefaultBibleVersions(): Boolean {
            var success = false
            var i = 0
            if (Core.isConnectedToInternet()) {
                val versions = listOf<String>("KJV", "JapBungo", "TagAngBiblia")
                versions.forEach {
                    if (!checkIfVersionExist(it)) {
                        install(it)
                        i++
                    } else
                        Log.i("Bible $it already exists.")
                }
                if (i >= 2)
                    success = true
                else
                    Log.i("Bible versions are already installed")
            } else {
                Log.w("Internet is not connected.")
            }
            return success
        }
        fun install(bookInitials: String): Boolean {
            var success = false
            try {
                // Set the directory where the modules will be saved
                // Set the directory where the modules will be stored
                val moduleDirs: Array<File> = arrayOf(File("modules"))
                SwordBookPath.setAugmentPath(moduleDirs)

                // Create an install manager and fetch the default CrossWire repository
                val installManager = InstallManager()
                val installer: Installer = installManager.getInstaller("CrossWire")

                // Get a list of all available books (Bibles, commentaries, etc.)
                val availableBooks: List<Book> = installer.books

                // Find the book you want to install, e.g., "KJV" (King James Version)
                val bookToInstall: Book = availableBooks.find { it.initials.equals(bookInitials, ignoreCase = true) }
                    ?: throw BookException("Bible version not found")

                // Install the book
                Log.i("Installing ${bookToInstall.initials}")
                installer.install(bookToInstall)
                Log.i("Installation complete!")
                success = true
            } catch (e: InstallException) {
                Log.w("Cannot install Bible version. %s", e.printStackTrace())
            } catch (e: BookException) {
                Log.w("Bible version installation exception: %s", e.printStackTrace())
            }
            return success
        }
        fun getBook(bookInitials: JsonArray, verseRef: String): List<MutableMap<String, Any>> {
            val listMap = mutableListOf<MutableMap<String, Any>>()

            try {
                bookInitials.forEach { version ->
                    val map = mutableMapOf<String, Any>()
                    Log.w("Book versions is ${version.asString}")
                    // Load the installed Bible
                    val book: Book? = Books.installed().getBook(version.asString)
                    if (book == null) {
                        Log.w("Bible version not found: $bookInitials")
                        return listMap
                    }

                    // Get the key representing the verse or passage using the provided reference
                    val key: Key = book.getKey(verseRef)

                    // Iterate through the key to handle multiple verses
                    for (verseKey in key) {
                        val data = BookData(book, verseKey)

                        // Get the verse reference (e.g., Genesis 1:1)
                        val verseReference = verseKey.name

                        // Extract the canonical text (i.e., plain text of the verse)
                        val verseText = OSISUtil.getCanonicalText(data.osisFragment)

                        // Add the verse reference and text to the map
                        map[verseReference] = verseText
                    }
                    listMap.add(map)
                }
            } catch (e: Exception) {
                Log.w("[IGNORE] : Chapter or verse doesn't exists. %s", e.printStackTrace())
            }

            return listMap
        }
        fun getInstalledBooks(): Map<String, Any> {
            val map = mutableMapOf<String, Any>()
            // Get a list of all installed books (Bibles, commentaries, dictionaries, etc.)
            val books: List<Book> = Books.installed().books

            // Search for a specific Bible version
            val searchVersion = "Philippine Bible Society (1905)" // You can also search by initials like "TAB"

            // Get all installed books
            for (book in Books.installed().books) {
                // Check if this is the desired Bible version
                map[book.initials] = book.name
                /*
                if (book.name == searchVersion) {
                    //Log.i("Bible initials: ${book.initials}")
                    //Log.i("Bible Version Found: ${book.name}")
                    // Get the list of all book names (e.g., Genesis, Exodus, etc.)
                }
                */
            }
            /*
            for (book in Books.installed().books) {
                Log.i(book.initials)
            }
            */
            return map.toSortedMap()
        }
        fun uninstallBook(bookInitials: String): Boolean {
            var success = false
            // Get the installed book by initials
            val book: Book? = Books.installed().getBook(bookInitials)

            if (book != null) {
                // Locate the JSword books installation directory
                val jswordDir = System.getProperty("user.home") + "/.sword/modules/texts/ztext"

                // Find the directory for the specific book
                val bookDir = File(jswordDir, bookInitials.lowercase())
                Log.w(bookDir.path)
                if (bookDir.exists()) {
                    // Delete the book directory and its contents
                    val deleted = bookDir.deleteRecursively()
                    if (deleted) {
                        Log.i("Book $bookInitials has been uninstalled successfully.")
                        Books.installed().removeBook(book)
                        success = true
                    } else {
                        Log.w("Failed to delete the book directory.")
                    }
                } else {
                    Log.w("The book directory does not exist for: $bookInitials")
                }
            } else {
                Log.w("Book not found: $bookInitials")
            }
            return success
        }
        private fun checkIfVersionExist(version: String): Boolean {
            var success = false
            for (book in Books.installed().books)
                if (book.initials == version)
                    success = true
            return success
        }
    }
}