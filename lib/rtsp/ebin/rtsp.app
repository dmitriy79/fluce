{application,rtsp,
             [{description,"RTSP handling library"},
              {vsn,"3.1"},
              {registered,[rtsp]},
              {applications,[kernel,stdlib,ranch]},
              {mod,{rtsp_app,[]}},
              {modules,[rtp,rtp_decoder,rtsp,rtsp_analyzer,rtsp_app,
                        rtsp_publish,rtsp_reader,rtsp_socket,rtsp_sup,
                        rtsp_test_client,sdp,sdp_encoder]}]}.
