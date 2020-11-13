import {useCallback, useEffect, useState} from "react";

const useMessages = (forum) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [readError, setReadError] = useState();
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState();
    const [stateVersion, setStateVersion] = useState(0);

    const create = useCallback(async (message) => {
        setCreateError(null);
        try {
            setCreating(true);
            const response = await fetch(`/messages/${forum}`, {
                method: 'POST',
                body: JSON.stringify(message),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(
                    `Unable to create a ${forum} message: ${text}`
                );
            }
            setStateVersion(v => v + 1);
        } catch(err) {
            setCreateError(err);
            throw err;
        } finally {
            setCreating(false);
        }
    }, [forum]);

    useEffect(() => {
        setReadError(null);
        if (forum) {
            (async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`/messages/${forum}`);
                    if (!response.ok) {
                        const text = await response.text();
                        throw new Error(
                            `Unable to read messages for ${forum}: ${text}`
                        );
                    }
                    const body = await response.json();
                    setData(body);
                } catch (err) {
                    setReadError(err);
                } finally {
                    setLoading(false);
                }
            })();
        } else {
            setData([]);
            setLoading(false);
        }
    }, [forum, stateVersion]);

    return {data, loading, readError, create, creating, createError};
};

export default useMessages;
