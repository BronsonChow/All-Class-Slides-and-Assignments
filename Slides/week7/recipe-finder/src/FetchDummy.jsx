import { useState, useEffect } from "react";

const URL = "https://dummyjson.com/recipes";

const FetchDummy = () => {
    const [query, setQuery] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        document.title = "Dummy API Recipe List"
        let alive = true

        async function fetchQuery()
        {
            try
            {
                const response = await fetch(URL)
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
        fetchQuery()
        return () => {
            alive = false
        }
    }, [])

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <div>
            <h2>{query.length} Recipes Total</h2>
            <br></br>
            {query.map(recipe => (
                <div key = {recipe.id}>
                    <h2>{recipe.name} : {recipe.cuisine}</h2>
                </div>
            ))}
        </div>
    )
}

export default FetchDummy