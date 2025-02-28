import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import CollectionModal from "../components/CollectionModal";
import "../../src/index.css";

const SubtemaDetail = () => {
  const { id, subIndex } = useParams();
  const [tema, setTema] = useState(null);
  const [subtema, setSubtema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  useEffect(() => {
    const fetchTema = async () => {
      try {
        const res = await axios.get(
          `https://rkhqsv30-5173.uks1.devtunnels.ms/api/temas/${id}`
        );
        setTema(res.data);
        const subIdx = parseInt(subIndex, 10);
        if (res.data.subtemas && res.data.subtemas.length > subIdx) {
          setSubtema(res.data.subtemas[subIdx]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener el tema:", error);
        setLoading(false);
      }
    };
    fetchTema();
  }, [id, subIndex]);

  if (loading) return <p>Cargando...</p>;
  if (!tema || !subtema) return <p>No se encontró el subtema.</p>;

  const handleOpenModal = (collection = null) => {
    setEditingCollection(collection);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCollection(null);
  };

  const handleSaveCollection = async (newCollection) => {
    try {
      const updatedTema = { ...tema };
      const subtemaIndex = updatedTema.subtemas.findIndex(
        (st) => st._id === subtema._id
      );

      if (subtemaIndex === -1) return;

      if (editingCollection) {
        updatedTema.subtemas[subtemaIndex].colecciones =
          updatedTema.subtemas[subtemaIndex].colecciones.map((col) =>
            col._id === editingCollection._id ? newCollection : col
          );
      } else {
        updatedTema.subtemas[subtemaIndex].colecciones.push(newCollection);
      }

      const res = await axios.put(
        `https://rkhqsv30-5173.uks1.devtunnels.ms/api/temas/${tema._id}`,
        updatedTema
      );

      setTema(res.data);
      setSubtema(res.data.subtemas[subtemaIndex]);
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar la colección:", error);
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    try {
      const updatedSubtemas = tema.subtemas.map((st) =>
        st._id === subtema._id
          ? { ...st, colecciones: st.colecciones.filter((col) => col._id !== collectionId) }
          : st
      );

      await axios.put(`https://rkhqsv30-5173.uks1.devtunnels.ms/api/temas/${id}`, {
        ...tema,
        subtemas: updatedSubtemas,
      });

      setTema((prevTema) => ({ ...prevTema, subtemas: updatedSubtemas }));
      setSubtema(updatedSubtemas.find((st) => st._id === subtema._id));
    } catch (error) {
      console.error("Error al eliminar la colección:", error);
    }
  };

  return (
    <div className="container">
      <Link to={`/temas/${id}`}>← Volver al tema</Link>
      <h2>{subtema.nombre}</h2>
      <p>Colecciones del subtema:</p>
      <div className="grid-container">
        {subtema.colecciones && subtema.colecciones.length > 0 ? (
          subtema.colecciones.map((coleccion) => (
            <div key={coleccion._id} className="card">
              <h3 className="card-title">{coleccion.nombre}</h3>
              {coleccion.imagenUrl && <img src={coleccion.imagenUrl} alt={coleccion.nombre} />}
              <div className="card-content">
                {JSON.parse(coleccion.contenido).map((seccion, index) => (
                  <div key={index} className="section">
                    {seccion.tituloSecundario && <h4 className="section-title">{seccion.tituloSecundario}</h4>}
                    <div dangerouslySetInnerHTML={{ __html: seccion.contenido }} />
                  </div>
                ))}
              </div>
              <div className="buttons">
                <button onClick={() => handleOpenModal(coleccion)}>✏️ Editar</button>
                <button onClick={() => handleDeleteCollection(coleccion._id)}>🗑️ Eliminar</button>
              </div>
            </div>
          ))
        ) : (
          <p>No hay colecciones en este subtema.</p>
        )}
      </div>
      <button className="floating-button" onClick={() => handleOpenModal()}>+</button>
      {isModalOpen && (
        <CollectionModal
          onSubmit={handleSaveCollection}
          initialData={editingCollection}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SubtemaDetail;











