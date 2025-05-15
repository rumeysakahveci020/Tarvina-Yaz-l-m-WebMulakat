// frontend/src/pages/BattlePage.jsx

import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getActiveBattle, voteInBattle, resetBattleState } from '../features/battle/battleSlice.js';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // useLocation eklendi

function BattlePage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation(); // Kullanıcının geldiği sayfayı login sonrası için saklamak üzere eklendi

    const { activeBattle, userVote, isLoading, isVoting, isError, message } = useSelector((state) => state.battle);
    const { user: loggedInUser } = useSelector((state) => state.auth);

    const [showResults, setShowResults] = useState(false);
    const [animatedVotes1, setAnimatedVotes1] = useState(0);
    const [animatedVotes2, setAnimatedVotes2] = useState(0);
    const [animatedPercentage1, setAnimatedPercentage1] = useState(0);
    const [animatedPercentage2, setAnimatedPercentage2] = useState(0);

    useEffect(() => {
        dispatch(getActiveBattle());
        return () => {
            dispatch(resetBattleState());
        };
    }, [dispatch]);

    const calculateAndAnimateResults = useCallback(() => {
        if (activeBattle) {
            const { votesPost1 = 0, votesPost2 = 0 } = activeBattle;
            const totalVotes = votesPost1 + votesPost2;
            const p1 = totalVotes > 0 ? Math.round((votesPost1 / totalVotes) * 100) : 0;
            const p2 = totalVotes > 0 ? Math.round((votesPost2 / totalVotes) * 100) : 0;

            setAnimatedVotes1(votesPost1);
            setAnimatedVotes2(votesPost2);

            let currentP1 = 0; // Animasyon için başlangıç değeri
            let currentP2 = 0;
            setAnimatedPercentage1(0); // Önce sıfırla
            setAnimatedPercentage2(0);

            const interval = setInterval(() => {
                let p1Updated = false;
                let p2Updated = false;

                if (currentP1 < p1) {
                    currentP1 = Math.min(currentP1 + 2, p1);
                    setAnimatedPercentage1(currentP1);
                    p1Updated = true;
                } else if (currentP1 > p1) { // Eğer hedef değer daha düşükse direkt ata
                    currentP1 = p1;
                    setAnimatedPercentage1(p1);
                } else {
                     setAnimatedPercentage1(p1); // Son değeri garantile
                }


                if (currentP2 < p2) {
                    currentP2 = Math.min(currentP2 + 2, p2);
                    setAnimatedPercentage2(currentP2);
                    p2Updated = true;
                } else if (currentP2 > p2) {
                    currentP2 = p2;
                    setAnimatedPercentage2(p2);
                } else {
                    setAnimatedPercentage2(p2); // Son değeri garantile
                }

                if (!p1Updated && !p2Updated && currentP1 === p1 && currentP2 === p2) {
                    clearInterval(interval);
                }
            }, 25);

            return () => clearInterval(interval);
        }
    }, [activeBattle]);

    useEffect(() => {
        if (activeBattle && (userVote || showResults)) {
            setShowResults(true);
            calculateAndAnimateResults();
        } else {
            // Eğer sonuçlar gösterilmiyorsa veya userVote yoksa, yüzdeleri sıfırla
            setAnimatedPercentage1(0);
            setAnimatedPercentage2(0);
        }
    }, [userVote, activeBattle, showResults, calculateAndAnimateResults]);

    const handleVote = (postIdVotedFor) => {
        if (!loggedInUser) {
            alert('Oy kullanmak için lütfen giriş yapın.');
            navigate('/login', { state: { from: location } });
            return;
        }
        if (activeBattle && !userVote && !isVoting) {
            dispatch(voteInBattle({ battleId: activeBattle._id, postIdVotedFor }))
                .unwrap()
                .then(() => {
                    // Başarılı oylama sonrası `userVote` güncellenecek ve yukarıdaki useEffect tetiklenecek.
                })
                .catch(err => {
                    alert(`Oylama Hatası: ${err.message || 'Bir sorun oluştu.'}`);
                });
        }
    };

    if (isLoading && !activeBattle) {
        return <div className="text-center mt-12 text-xl text-gray-600">Aktif Karşılaşma Aranıyor...</div>;
    }

    if (isError && !activeBattle && message !== 'Şu an aktif bir karşılaşma bulunmuyor.') {
        return (
            <div className="text-center mt-12">
                <p className="text-xl text-red-500">Karşılaşma yüklenirken bir sorun oluştu.</p>
                <p className="text-gray-500 mt-2">{message}</p>
                <button onClick={() => dispatch(getActiveBattle())} className="mt-4 btn-secondary px-6 py-2">Tekrar Dene</button>
            </div>
        );
    }

    if (!activeBattle) {
        return (
            <div className="text-center mt-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xl text-gray-700 mt-4">{message || 'Görünüşe göre şu an aktif bir karşılaşma yok.'}</p>
                <p className="text-gray-500 mt-1">Daha sonra tekrar kontrol edin veya yeni yazılar ekleyin!</p>
                <Link to="/" className="mt-6 btn-primary px-6 py-2.5 inline-block">Ana Sayfaya Dön</Link>
            </div>
        );
    }

    const { post1, post2 } = activeBattle;

    const PostCard = ({ post, onVoteClick, currentVotes, currentPercentage, isVotedForByCurrentUser, canUserVote, hasUserVotedInThisBattle }) => (
        <div className={`card w-full md:w-[45%] p-4 sm:p-6 flex flex-col items-center transition-all duration-300 ease-in-out
                        ${hasUserVotedInThisBattle && isVotedForByCurrentUser ? 'border-4 border-green-500 transform scale-105 shadow-2xl' : 'border-gray-200'}
                        ${hasUserVotedInThisBattle && !isVotedForByCurrentUser ? 'opacity-60' : ''}
                      `}>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-center h-16 line-clamp-2 text-gray-800">{post.title}</h2>
            {post.imageUrl && (
                <Link to={`/posts/${post._id}`} target="_blank" rel="noopener noreferrer" className="block w-full h-48 sm:h-56 overflow-hidden rounded-md mb-3 shadow">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                </Link>
            )}
            <p className="text-sm text-gray-600 mb-3 line-clamp-3 h-[4.5rem] text-center sm:text-left">{post.excerpt}</p>
            <Link to={`/posts/${post._id}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 underline text-sm mb-4 font-medium">
                Yazının Tamamını Oku
            </Link>

            <div className="w-full mt-auto pt-4 border-t border-gray-200">
                {showResults || hasUserVotedInThisBattle ? (
                    <div className="text-center">
                        <div className="text-4xl font-bold text-indigo-700 mb-1">{currentPercentage}%</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider">({currentVotes} OY)</div>
                        <div className="w-full bg-gray-200 rounded-full h-3.5 mt-2.5 overflow-hidden shadow-inner">
                            <div
                                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${currentPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                ) : (
                    canUserVote && (
                        <button
                            onClick={() => onVoteClick(post._id)}
                            disabled={isVoting}
                            className="btn-primary w-full py-3 text-base font-semibold bg-green-600 hover:bg-green-700 focus:ring-green-500"
                        >
                            {isVoting ? (
                                <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.865.802V10.333z" />
                                </svg>
                                BU YAZIYA OY VER
                                </>
                            ) }
                        </button>
                    )
                )}
                {!loggedInUser && !showResults && !hasUserVotedInThisBattle && (
                     <button
                        onClick={() => {
                            alert('Oy kullanmak için lütfen giriş yapın.');
                            navigate('/login', { state: { from: location } });
                        }}
                        className="btn-secondary w-full py-3 text-base font-semibold"
                    >
                        Oy Kullanmak İçin Giriş Yapın
                    </button>
                )}
                 {loggedInUser && !canUserVote && !showResults && !hasUserVotedInThisBattle && (
                     <p className="mt-4 text-center text-sm text-gray-500">Bu karşılaşmaya daha önce oy kullandınız.</p>
                 )}
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-2 sm:px-4 py-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
                    KALEM MEYDANI!
                </h1>
                <p className="text-gray-600 mt-2 text-lg sm:text-xl">Hangi kalem daha keskin? Karar sizin!</p>
            </div>

            {message && !isVoting && ( // Sadece genel mesajları göster, oylama sırasındaki değil
                <p className={`text-center mb-6 text-sm ${isError ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}`}>
                    {message}
                </p>
            )}

            <div className="flex flex-col md:flex-row justify-center items-stretch md:space-x-6 lg:space-x-8 space-y-6 md:space-y-0">
                <PostCard
                    post={post1}
                    onVoteClick={handleVote}
                    currentVotes={animatedVotes1}
                    currentPercentage={animatedPercentage1}
                    isVotedForByCurrentUser={userVote === post1._id}
                    canUserVote={loggedInUser && !userVote}
                    hasUserVotedInThisBattle={!!userVote}
                />
                <div className="flex items-center justify-center my-4 md:my-0">
                    <span className="text-4xl font-black text-gray-400 p-3 transform rotate-[-5deg]">VS</span>
                </div>
                <PostCard
                    post={post2}
                    onVoteClick={handleVote}
                    currentVotes={animatedVotes2}
                    currentPercentage={animatedPercentage2}
                    isVotedForByCurrentUser={userVote === post2._id}
                    canUserVote={loggedInUser && !userVote}
                    hasUserVotedInThisBattle={!!userVote}
                />
            </div>

            {(showResults || userVote) && (
                <div className="text-center mt-12">
                    <button
                        onClick={() => {
                            setShowResults(false);
                            // Yüzdeleri sıfırla ki animasyon tekrar başlasın
                            setAnimatedPercentage1(0);
                            setAnimatedPercentage2(0);
                            // Oyları sıfırlamaya gerek yok, backend'den güncel gelecek
                            dispatch(resetBattleState());
                            dispatch(getActiveBattle());
                        }}
                        disabled={isLoading}
                        className="btn-primary px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            "Başka Bir Karşılaşma Göster"
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

export default BattlePage;