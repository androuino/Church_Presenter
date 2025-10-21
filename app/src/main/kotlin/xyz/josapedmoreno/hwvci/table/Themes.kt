package xyz.josapedmoreno.hwvci.table

import com.google.gson.JsonObject
import com.intellisrc.core.Log
import com.intellisrc.db.auto.Table
import xyz.josapedmoreno.hwvci.model.Theme

class Themes : Table<Theme>() {
    fun saveTheme(data: JsonObject): Boolean {
        var success = false
        val theme = Theme()
        theme.themeName = data.get("themeName").asString
        theme.font = data.get("font").asString
        theme.fontSize = data.get("fontSize").asInt
        theme.fontColor = data.get("fontColor").asString
        theme.bold = data.get("bold").asBoolean
        theme.italic = data.get("italic").asBoolean
        theme.strikeThrough = data.get("strikeThrough").asBoolean
        theme.topLeftOffset = data.get("topLeftOffset").asInt
        theme.topMiddleOffset = data.get("topMiddleOffset").asInt
        theme.topRightOffset = data.get("topRightOffset").asInt
        theme.leftUpperOffset = data.get("leftUpperOffset").asInt
        theme.rightUpperOffset = data.get("rightUpperOffset").asInt
        theme.leftMiddleOffset = data.get("leftMiddleOffset").asInt
        theme.rightMiddleOffset = data.get("rightMiddleOffset").asInt
        theme.leftLowerOffset = data.get("leftLowerOffset").asInt
        theme.rightLowerOffset = data.get("rightLowerOffset").asInt
        theme.leftBottomOffset = data.get("leftBottomOffset").asInt
        theme.middleBottomOffset = data.get("middleBottomOffset").asInt
        theme.rightBottomOffset = data.get("rightBottomOffset").asInt
        theme.textAlign = data.get("textAlign").asString
        theme.justifyContent = data.get("justifyContent").asString
        theme.alignItems = data.get("alignItems").asString
        success = if (checkDuplicate(theme.themeName)) {
            theme.id = data.get("id").asInt
            update(theme, arrayListOf("id"))
        } else {
            table.insert(theme.toMap())
        }
        return success
    }
    fun getTheme(data: JsonObject) : MutableMap<String, Any?> {
        val themeName = data.get("theme").asString
        val theme = find("theme_name", themeName).toMap()
        return theme.ifEmpty { mutableMapOf() }
    }
    fun getThemes() : List<Map<String, Any>> {
        val list = mutableListOf<Map<String, Any>>()
        val data = table.get().toListMap()
        data.forEach { theme ->
            list.add(mapOf("id" to theme["id"].toString().toInt(), "themeName" to theme["theme_name"].toString()))
        }
        return list.ifEmpty { emptyList() }
    }
    fun deleteTheme(id: Int): Boolean {
        var success = false
        if (themeExists(id))
            success = delete(id)
        return success
    }
    fun createDefaultTheme(): Boolean {
        var success = false
        if (!checkDuplicate("Default")) {
            success = table.insert(Theme().toMap())
        }
        return success
    }
    fun getByThemeName(themeName: String): MutableMap<String, Any?> {
        val data = find("theme_name", themeName).toMap()
        return data.ifEmpty { mutableMapOf() }
    }
    private fun checkDuplicate(themeName: String): Boolean {
        var success = false
        val item = find("theme_name", themeName)
        if (item != null)
            success = true
        return success
    }
    private fun themeExists(id: Int) : Boolean {
        var success = false
        val item = find("id", id)
        if (item.id == id)
            success = true
        return success
    }
}