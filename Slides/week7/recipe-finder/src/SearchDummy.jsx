import { useState, useEffect } from "react";

const SearchDummy = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [query, setQuery] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        document.title = "Dummy API Recipe List"
        let alive = true

        async function searchQuery()
        {
            try
            {
                const response = await fetch(`https://dummyjson.com/recipes/search?q=${searchTerm}`)
                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                const data = await response.json()
                if (alive) {
                    setQuery(data.recipes)
                }
            }
            catch (err)
            {
                if (alive) setError(err.message)
            }
            finally
            {
                if (alive) setLoading(false)
            }
        }
        searchQuery()
        return () => {
            alive = false
        }
    }, [])

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <div>
            <h1>Dummy API Recipe List</h1>
            <input type="text" placeholder="Search recipes..." />
            <h2>{query.length} Recipes Found</h2>
            <br></br>
            {query.map(recipe => (
                <div key = {recipe.id}>
                    <h2>{recipe.name} : {recipe.cuisine}</h2>
                </div>
            ))}
        </div>
    )
}

export default SearchDummy