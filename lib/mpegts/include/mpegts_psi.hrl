-record(dvb_ca_desc, {
  system_id,
  pid,
  private
}).

-record(psi_table, {
  pid,
  table,
  table_id,
  stream_id,
  version,
  current_next,
  section_number,
  last_section_number,
  body,
  raw
}).

-record(pmt_entry, {
  pid,
  codec,
  content,
  language,
  stream_type,
  program,
  track_id,
  info = []
}).


-define(DESCRIPTOR_IOD, 29).
-define(DESCRIPTOR_CA, 9).
-define(DESCRIPTOR_SL, 31).




-define(TYPE_VIDEO_MPEG1, 1).
-define(TYPE_VIDEO_MPEG2, 2).
-define(TYPE_TELETEXT,    6).
-define(TYPE_VIDEO_MPEG4, 16).
-define(TYPE_METADATA,    21).
-define(TYPE_VIDEO_H264,  27).
-define(TYPE_VIDEO_H264_ENC,  16#db). % 219
-define(TYPE_VIDEO_HEVC,  36). % 16#24
-define(TYPE_VIDEO_VC1,   234).
-define(TYPE_VIDEO_DIRAC, 209).
-define(TYPE_AUDIO_MPEG1, 3).
-define(TYPE_AUDIO_MPEG2, 4).
-define(TYPE_AUDIO_AAC,   15).
-define(TYPE_AUDIO_AAC_ENC,   16#cf). % 207
-define(TYPE_AUDIO_AAC2,  17). % LATM
-define(TYPE_AUDIO_AC3,   6).
-define(TYPE_DATA_SCTE35, 134).
-define(TYPE_AUDIO_EAC3,  135).
-define(TYPE_AUDIO_DTS,   138).

-define(TYPE_AUDIO_PCMA,  206).


-define(G_MOVIE,            'Movie / Drama').
-define(G_DETECTIVE,        'Detective / Thriller').
-define(G_ADVENTURE,        'Adventure / Western / War').
-define(G_SCIFI,            'Science fiction / Fantasy / Horror').
-define(G_COMEDY,           'Comedy').
-define(G_SOAP,             'Soap / Melodrama / Folkloric').
-define(G_ROMANCE,          'Romance').
-define(G_SERIOUS,          'Serious / Classical / Religious / Historical movie / Drama').
-define(G_DRAMA,            'Adult movie / Drama').
-define(G_NEWS,             'News / Current affairs').
-define(G_NEWS_WEATHER,     'News / Weather report').
-define(G_NEWS_MAGAZINE,    'News magazine').
-define(G_DOCUMENTARY,      'Documentary').
-define(G_DISCUSSION,       'Discussion / Interview / Debate').
-define(G_SHOW_GENERAL,     'Show / Game show').
-define(G_SHOW_GAME,        'Game show / Quiz / Contest').
-define(G_SHOW_VARIETY,     'Variety show').
-define(G_SHOW_TALK,        'Talk show').
-define(G_SPORTS,           'Sports').
-define(G_SPORTS_EVENTS,    'Special events').
-define(G_SPORTS_MAGAZINE,  'Sport magazines').
-define(G_SPORTS_FOOTBALL,  'Football / Soccer').
-define(G_SPORTS_TENNIS,    'Tennis / Squash').
-define(G_SPORTS_TEAM,      'Team sports').
-define(G_SPORTS_ATHLETICS, 'Athletics').
-define(G_SPORTS_MOTOR,     'Motor sport').
-define(G_SPORTS_WATER,     'Water sport').
-define(G_SPORTS_WINTER,    'Winter sport').
-define(G_SPORTS_EQUESTRIAN,'Equestrian').
-define(G_SPORTS_MARTIAL,   'Martial sports').
-define(G_KIDS,             'Children\'s / Youth programs').
-define(G_KIDS_PRESCHOOL,   'Pre-school children\'s programs').
-define(G_KIDS_ENT_6_14,    'Entertainment programs for 6 to 14').
-define(G_KIDS_ENT_10_16,   'Entertainment programs for 10 to 16').
-define(G_KIDS_EDU,         'Informational / Educational / School programs').
-define(G_KIDS_TOONS,       'Cartoons / Puppets').
-define(G_MUSIC,            'Music / Ballet / Dance').
-define(G_MUSIC_ROCK,       'Rock / Pop').
-define(G_MUSIC_CLASSIC,    'Serious music / Classical music').
-define(G_MUSIC_FOLK,       'Folk / Traditional music').
-define(G_MUSIC_JAZZ,       'Jazz').
-define(G_MUSIC_OPERA,      'Musical / Opera').
-define(G_MUSIC_BALLET,     'Ballet').
-define(G_ART,              'Arts / Culture').
-define(G_ART_PERF,         'Performing arts').
-define(G_ART_FINE,         'Fine arts').
-define(G_ART_RELIGION,     'Religion').
-define(G_ART_POP,          'Popular culture / Traditional arts').
-define(G_ART_LIT,          'Literature').
-define(G_ART_FILM,         'Film / Cinema').
-define(G_ART_EXP_FILM,     'Experimental film / Video').
-define(G_ART_PRESS,        'Broadcasting / Press').
-define(G_ART_NEWMEDIA,     'New media').
-define(G_ART_MAGAZINES,    'Arts magazines / Culture magazines').
-define(G_ART_FASHION,      'Fashion').
-define(G_SOCIAL,           'Social / Political issues / Economics').
-define(G_REPORTS,          'Magazines / Reports / Documentary').
-define(G_ECONOMICS,        'Economics / Social advisory').
-define(G_REMARKABLE,       'Remarkable people').
-define(G_EDU,              'Education / Science / Factual topics').
-define(G_NATURE,           'Nature / Animals / Environment').
-define(G_TECH,             'Technology / Natural sciences').
-define(G_MEDICINE,         'Medicine / Physiology / Psychology').
-define(G_FOREIGN,          'Foreign countries / Expeditions').
-define(G_SOCIAL_SCN,       'Social / Spiritual sciences').
-define(G_FURTHER_EDU,      'Further education').
-define(G_EDU_LANG,         'Languages').
-define(G_LEISURE,          'Leisure hobbies').
-define(G_TOURISM,          'Tourism / Travel').
-define(G_HANDICRAFT,       'Handicraft').
-define(G_MOTORING,         'Motoring').
-define(G_FITNESS,          'Fitness and health').
-define(G_COOKING,          'Cooking').
-define(G_SHOPPING,         'Advertisement / Shopping').
-define(G_GARDENING,        'Gardening').
-define(G_LANG_ORIG,        'Original language').
-define(G_BW,               'Black & White').
-define(G_UNPUB,            'Unpublished').
-define(G_LIVE,             'Live broadcast').


