package xyz.josapedmoreno.hwvci.control

import com.intellisrc.core.Log
import org.crosswire.jsword.book.Book
import org.crosswire.jsword.book.BookData
import org.crosswire.jsword.book.BookException
import org.crosswire.jsword.book.Books
import org.crosswire.jsword.book.OSISUtil
import org.crosswire.jsword.book.install.InstallException
import org.crosswire.jsword.book.install.InstallManager
import org.crosswire.jsword.book.install.Installer
import org.crosswire.jsword.book.sword.SwordBookPath
import org.crosswire.jsword.passage.Key
import java.io.File

class BookApi {
    companion object {
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
                println("Installing ${bookToInstall.initials}")
                installer.install(bookToInstall)
                println("Installation complete!")
                success = true
            } catch (e: InstallException) {
                e.printStackTrace()
            } catch (e: BookException) {
                e.printStackTrace()
            }
            return success
        }
        fun getBook(bookInitials: String, verseRef: String): String {
            var verse = ""
            try {
                // Load the installed Bible
                val book: Book? = Books.installed().getBook(bookInitials)
                if (book == null) {
                    println("Bible version not found: $bookInitials")
                    return verse
                }

                // Get the verse using the provided reference
                val key: Key = book.getKey(verseRef)
                val data: BookData = BookData(book, key)

                // Extract the canonical text (i.e., plain text)
                verse = OSISUtil.getCanonicalText(data.osisFragment)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            return verse
        }
        fun getInstalledBooks() {
            // Get a list of all installed books (Bibles, commentaries, dictionaries, etc.)
            val books: List<Book> = Books.installed().books

            // Search for a specific Bible version
            val searchVersion = "Philippine Bible Society (1905)" // You can also search by initials like "TAB"

            // Get all installed books
            /*
            for (book in Books.installed().books) {
                // Check if this is the desired Bible version
                if (book.name == searchVersion) {
                    Log.i("Bible initials: ${book.initials}")
                    Log.i("Bible Version Found: ${book.name}")

                    // Get the list of all book names (e.g., Genesis, Exodus, etc.)
                    /*val globalKeyList: Key = book.globalKeyList
                    for (key in globalKeyList) {
                        Log.i("Book Name: ${key.name}")
                    }*/
                }
            }
            */
            for (book in Books.installed().books) {
                Log.i(book.initials)
            }
        }
    }
}